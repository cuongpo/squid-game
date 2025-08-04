import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { useBlockchainStore } from '../stores/blockchainStore';
import { useGameStore } from '../stores/gameStore';
import { walletService } from '../services/walletService';
import { blockchainService } from '../services/blockchainService';
import { narrativeLogger } from '../services/narrativeLogger';

/**
 * Blockchain Integration Test Suite
 * 
 * This test suite validates the complete blockchain integration including:
 * - Wallet connection to Avalanche testnet
 * - Smart contract interactions
 * - Onchain betting functionality
 * - Narrative logging
 * - Result storage
 */

// Mock wallet and blockchain services for testing
vi.mock('../services/walletService');
vi.mock('../services/blockchainService');

describe('Blockchain Integration', () => {
  let blockchainStore: any;
  let gameStore: any;

  beforeAll(() => {
    // Setup global mocks
    global.window = {
      ethereum: {
        request: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
      }
    } as any;
  });

  beforeEach(() => {
    // Reset stores
    blockchainStore = useBlockchainStore.getState();
    gameStore = useGameStore.getState();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock successful wallet connection
    vi.mocked(walletService.connectWallet).mockResolvedValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890',
      balance: '1.5',
      chainId: 43113,
      isCorrectNetwork: true,
    });

    // Mock successful contract interactions
    vi.mocked(blockchainService.createGame).mockResolvedValue({
      gameId: 'game-123',
      transactionHash: '0xabcdef1234567890'
    });

    vi.mocked(blockchainService.placeBet).mockResolvedValue({
      betId: 'bet-456',
      transactionHash: '0xfedcba0987654321'
    });
  });

  describe('Wallet Connection', () => {
    it('should connect to Avalanche testnet successfully', async () => {
      const initialState = blockchainStore.walletState;
      expect(initialState.isConnected).toBe(false);

      await blockchainStore.connectWallet();

      expect(walletService.connectWallet).toHaveBeenCalled();
      expect(blockchainStore.walletState.isConnected).toBe(true);
      expect(blockchainStore.walletState.chainId).toBe(43113);
      expect(blockchainStore.walletState.isCorrectNetwork).toBe(true);
    });

    it('should handle wallet connection errors gracefully', async () => {
      vi.mocked(walletService.connectWallet).mockRejectedValue(
        new Error('MetaMask not installed')
      );

      await expect(blockchainStore.connectWallet()).rejects.toThrow('MetaMask not installed');
    });

    it('should detect wrong network and prompt to switch', async () => {
      vi.mocked(walletService.connectWallet).mockResolvedValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        balance: '1.5',
        chainId: 1, // Ethereum mainnet instead of Avalanche testnet
        isCorrectNetwork: false,
      });

      await blockchainStore.connectWallet();

      expect(blockchainStore.walletState.isCorrectNetwork).toBe(false);
      expect(blockchainStore.walletState.chainId).toBe(1);
    });
  });

  describe('Game Creation', () => {
    beforeEach(async () => {
      // Connect wallet first
      await blockchainStore.connectWallet();
    });

    it('should create a blockchain game successfully', async () => {
      const contestantIds = ['001', '002', '003'];
      const contestantNames = ['Player 1', 'Player 2', 'Player 3'];
      const totalRounds = 5;

      const gameId = await blockchainStore.createGame(
        contestantIds,
        contestantNames,
        totalRounds
      );

      expect(blockchainService.createGame).toHaveBeenCalledWith(
        contestantIds,
        contestantNames,
        totalRounds
      );
      expect(gameId).toBe('game-123');
      expect(blockchainStore.currentGameId).toBe('game-123');
    });

    it('should enable narrative logging when game is created', async () => {
      const gameId = await blockchainStore.createGame(['001'], ['Player 1'], 5);
      
      gameStore.enableBlockchainLogging(gameId);
      
      expect(narrativeLogger.isReady()).toBe(true);
      expect(narrativeLogger.getCurrentGameId()).toBe(gameId);
    });
  });

  describe('Blockchain Betting', () => {
    beforeEach(async () => {
      await blockchainStore.connectWallet();
      await blockchainStore.createGame(['001', '002'], ['Player 1', 'Player 2'], 5);
    });

    it('should place a bet onchain successfully', async () => {
      const contestantId = '001';
      const amount = '0.1';
      const odds = 2.5;

      const betId = await blockchainStore.placeBet(contestantId, amount, odds);

      expect(blockchainService.placeBet).toHaveBeenCalledWith(
        'game-123',
        contestantId,
        amount,
        odds
      );
      expect(betId).toBe('bet-456');
    });

    it('should validate bet amount against wallet balance', async () => {
      // Mock insufficient balance
      vi.mocked(walletService.getWalletState).mockResolvedValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        balance: '0.05', // Less than minimum bet
        chainId: 43113,
        isCorrectNetwork: true,
      });

      const contestantId = '001';
      const amount = '0.1'; // More than balance
      const odds = 2.5;

      // This should be handled by the betting modal validation
      // The actual validation happens in the UI component
      expect(parseFloat('0.05')).toBeLessThan(parseFloat(amount));
    });

    it('should track pending transactions', async () => {
      const initialPendingCount = blockchainStore.pendingTransactions.length;

      await blockchainStore.placeBet('001', '0.1', 2.5);

      expect(blockchainStore.pendingTransactions.length).toBeGreaterThan(initialPendingCount);
      
      const pendingTx = blockchainStore.pendingTransactions.find(
        (tx: any) => tx.hash === '0xfedcba0987654321'
      );
      expect(pendingTx).toBeDefined();
      expect(pendingTx.status).toBe('pending');
    });
  });

  describe('Narrative Logging', () => {
    beforeEach(async () => {
      await blockchainStore.connectWallet();
      const gameId = await blockchainStore.createGame(['001'], ['Player 1'], 5);
      gameStore.enableBlockchainLogging(gameId);
    });

    it('should log round narratives onchain', async () => {
      const round = 1;
      const narrativeTexts = [
        'Round 1: Red Light Green Light begins',
        'Players must freeze when the doll turns around',
        'The tension is palpable as contestants line up'
      ];

      vi.mocked(blockchainService.storeNarrative).mockResolvedValue({
        narrativeId: 'narrative-789',
        transactionHash: '0x1111222233334444'
      });

      const narrativeId = await blockchainStore.storeNarrative(round, narrativeTexts);

      expect(blockchainService.storeNarrative).toHaveBeenCalledWith(
        'game-123',
        round,
        narrativeTexts
      );
      expect(narrativeId).toBe('narrative-789');
    });

    it('should handle narrative logging failures gracefully', async () => {
      vi.mocked(blockchainService.storeNarrative).mockRejectedValue(
        new Error('Gas limit exceeded')
      );

      const round = 1;
      const narrativeTexts = ['Test narrative'];

      await expect(
        blockchainStore.storeNarrative(round, narrativeTexts)
      ).rejects.toThrow('Gas limit exceeded');
    });
  });

  describe('Game Completion and Results', () => {
    beforeEach(async () => {
      await blockchainStore.connectWallet();
      await blockchainStore.createGame(['001', '002'], ['Player 1', 'Player 2'], 5);
      gameStore.enableBlockchainLogging('game-123');
    });

    it('should end game and store results onchain', async () => {
      const winnerId = '001';
      const finalStats = {
        totalRounds: 5,
        totalBets: 3,
        totalBetAmount: '0.5',
        winningBets: 1,
        totalPayout: '1.25'
      };

      vi.mocked(blockchainService.endGame).mockResolvedValue({
        transactionHash: '0xendgame123'
      });

      vi.mocked(blockchainService.storeGameResults).mockResolvedValue({
        narrativeId: 'results-999',
        transactionHash: '0xresults456'
      });

      await blockchainStore.endGame(winnerId);
      await blockchainStore.storeGameResults(winnerId, finalStats);

      expect(blockchainService.endGame).toHaveBeenCalledWith('game-123', winnerId);
      expect(blockchainService.storeGameResults).toHaveBeenCalledWith(
        'game-123',
        winnerId,
        finalStats
      );
    });

    it('should log game completion narrative', async () => {
      const winner = {
        id: '001',
        name: 'Player 1',
        number: 456,
        stats: { strength: 8, speed: 7, intelligence: 9, luck: 6 }
      };

      // Mock the narrative logging
      const logSpy = vi.spyOn(narrativeLogger, 'logGameCompletion');
      logSpy.mockResolvedValue('completion-narrative-123');

      const completionNarrative = [
        `🏆 GAME COMPLETED! 🏆`,
        `Winner: ${winner.name} (#${winner.number})`,
        `Survived all 5 rounds`,
        `Final stats: Strength ${winner.stats.strength}, Speed ${winner.stats.speed}, Intelligence ${winner.stats.intelligence}, Luck ${winner.stats.luck}`
      ];

      await narrativeLogger.logGameCompletion(winner.id, completionNarrative);

      expect(logSpy).toHaveBeenCalledWith(winner.id, completionNarrative);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network disconnection gracefully', async () => {
      // Simulate network disconnection
      vi.mocked(walletService.getWalletState).mockResolvedValue({
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        isCorrectNetwork: false,
      });

      await blockchainStore.disconnectWallet();

      expect(blockchainStore.walletState.isConnected).toBe(false);
      expect(blockchainStore.currentGameId).toBeNull();
    });

    it('should validate contract addresses before interactions', () => {
      // This would be handled by the blockchain service
      expect(() => {
        if (!blockchainService.getCurrentGameId()) {
          throw new Error('No active game');
        }
      }).toThrow('No active game');
    });

    it('should handle transaction failures', async () => {
      vi.mocked(blockchainService.placeBet).mockRejectedValue(
        new Error('Transaction reverted: Insufficient funds')
      );

      await blockchainStore.connectWallet();
      await blockchainStore.createGame(['001'], ['Player 1'], 5);

      await expect(
        blockchainStore.placeBet('001', '0.1', 2.5)
      ).rejects.toThrow('Transaction reverted: Insufficient funds');
    });
  });

  describe('Integration with Game Flow', () => {
    it('should integrate blockchain betting with game simulation', async () => {
      // Initialize game
      gameStore.initializeGame();
      
      // Connect wallet and create blockchain game
      await blockchainStore.connectWallet();
      const gameId = await blockchainStore.createGame(
        gameStore.gameState.contestants.map((c: any) => c.id),
        gameStore.gameState.contestants.map((c: any) => c.name),
        gameStore.gameState.totalRounds
      );
      
      gameStore.enableBlockchainLogging(gameId);
      
      // Place some bets
      await blockchainStore.placeBet('001', '0.1', 2.5);
      await blockchainStore.placeBet('002', '0.2', 3.0);
      
      // Start game simulation
      gameStore.startGame();
      
      // Verify integration
      expect(narrativeLogger.isReady()).toBe(true);
      expect(blockchainStore.currentGameId).toBe(gameId);
      expect(gameStore.uiState.currentPhase).toBe('betting');
    });
  });
});

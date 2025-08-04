import { create } from 'zustand';
import { walletService } from '../services/walletService';
import { blockchainService } from '../services/blockchainService';
import type { 
  WalletState, 
  BlockchainBet, 
  OnchainGameState, 
  TransactionStatus 
} from '../types/blockchain';

interface BlockchainStore {
  // Wallet state
  walletState: WalletState;
  
  // Game state
  onchainGameState: OnchainGameState | null;
  currentGameId: string | null;
  
  // Betting state
  blockchainBets: BlockchainBet[];
  pendingTransactions: TransactionStatus[];
  
  // UI state
  isConnecting: boolean;
  isCreatingGame: boolean;
  isPlacingBet: boolean;
  isStoringNarrative: boolean;
  autoApproveTransactions: boolean;
  disableRoundLogging: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchToCorrectNetwork: () => Promise<void>;
  
  // Game actions
  createGame: (contestantIds: string[], contestantNames: string[], totalRounds: number) => Promise<string>;
  placeBet: (contestantId: string, amount: string, odds: number) => Promise<string>;
  storeNarrative: (round: number, narrativeTexts: string[]) => Promise<string>;
  completeRound: (eliminatedContestants: string[]) => Promise<void>;
  endGame: (winnerId: string) => Promise<void>;
  storeGameResults: (winnerId: string, finalStats: any) => Promise<void>;

  // Data fetching
  refreshGameState: () => Promise<void>;
  refreshUserBets: () => Promise<void>;
  checkTransactionStatus: (txHash: string) => Promise<void>;
  
  // Utility
  setCurrentGameId: (gameId: string) => void;
  addPendingTransaction: (tx: TransactionStatus) => void;
  removePendingTransaction: (txHash: string) => void;
  setAutoApproveTransactions: (enabled: boolean) => void;
  setDisableRoundLogging: (disabled: boolean) => void;
  initializeContracts: () => Promise<void>;
}

export const useBlockchainStore = create<BlockchainStore>((set, get) => ({
  // Initial state
  walletState: {
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    isCorrectNetwork: false,
  },
  
  onchainGameState: null,
  currentGameId: null,
  blockchainBets: [],
  pendingTransactions: [],
  
  isConnecting: false,
  isCreatingGame: false,
  isPlacingBet: false,
  isStoringNarrative: false,
  autoApproveTransactions: false,
  disableRoundLogging: false,

  // Wallet actions
  connectWallet: async () => {
    set({ isConnecting: true });
    try {
      const walletState = await walletService.connectWallet();
      set({ walletState, isConnecting: false });

      // Initialize blockchain contracts after wallet connection
      if (walletState.isConnected && walletState.isCorrectNetwork) {
        await blockchainService.initializeContracts();

        // Refresh user data after connecting
        if (walletState.address) {
          get().refreshUserBets();
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ isConnecting: false });
      throw error;
    }
  },

  disconnectWallet: async () => {
    await walletService.disconnectWallet();
    set({
      walletState: {
        isConnected: false,
        address: null,
        balance: '0',
        chainId: null,
        isCorrectNetwork: false,
      },
      blockchainBets: [],
      onchainGameState: null,
      currentGameId: null,
    });
  },

  switchToCorrectNetwork: async () => {
    try {
      await walletService.switchToCorrectNetwork();
      const walletState = await walletService.getWalletState();
      set({ walletState });
    } catch (error) {
      console.error('Failed to switch to correct network:', error);
      throw error;
    }
  },

  // Game actions
  createGame: async (contestantIds: string[], contestantNames: string[], totalRounds: number) => {
    set({ isCreatingGame: true });
    try {
      const result = await blockchainService.createGame(contestantIds, contestantNames, totalRounds);
      
      set({ 
        currentGameId: result.gameId,
        isCreatingGame: false 
      });
      
      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });
      
      // Start monitoring transaction
      get().checkTransactionStatus(result.transactionHash);
      
      return result.gameId;
    } catch (error) {
      set({ isCreatingGame: false });
      console.error('Failed to create game:', error);
      throw error;
    }
  },

  placeBet: async (contestantId: string, amount: string, odds: number) => {
    // Add delay to avoid rate limiting
    console.log('⏳ Adding delay to avoid rate limiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    let { currentGameId } = get();

    // If no game exists, create a single-player game with all contestants
    if (!currentGameId) {
      console.log('No active game found, creating single-player game with all contestants...');
      try {
        // Get all contestant IDs and names from the game store
        const gameStore = (await import('./gameStore')).useGameStore.getState();
        const contestants = gameStore.gameState.contestants;

        if (contestants.length === 0) {
          throw new Error('No contestants available. Please initialize the game first.');
        }

        const contestantIds = contestants.map(c => c.id);
        const contestantNames = contestants.map(c => c.name);

        // Create game with all contestants so any can be bet on
        currentGameId = await get().createGame(
          contestantIds,
          contestantNames,
          5 // Total rounds
        );

        console.log('Single-player game created with all contestants:', currentGameId);

        // Enable narrative logging
        gameStore.enableBlockchainLogging(currentGameId);
      } catch (error) {
        console.error('Failed to create single-player game:', error);

        // If rate limited, provide helpful message
        if (error instanceof Error && error.message.includes('rate limited')) {
          throw new Error('⏳ Network is busy. Please wait 30 seconds and try again.');
        }

        throw new Error('Failed to create game. Please try again.');
      }
    }

    set({ isPlacingBet: true });
    try {
      const result = await blockchainService.placeBet(currentGameId, contestantId, amount, odds);

      set({ isPlacingBet: false });

      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });

      // Start monitoring transaction
      get().checkTransactionStatus(result.transactionHash);

      return result.betId;
    } catch (error) {
      set({ isPlacingBet: false });
      console.error('Failed to place bet:', error);
      throw error;
    }
  },

  storeNarrative: async (round: number, narrativeTexts: string[]) => {
    const { currentGameId, disableRoundLogging } = get();
    if (!currentGameId) {
      throw new Error('No active game');
    }

    // Skip round logging if disabled (but allow final game results - round 999/1000)
    if (disableRoundLogging && round < 999) {
      console.log(`Round logging disabled, skipping narrative for round ${round}`);
      return 'skipped';
    }

    set({ isStoringNarrative: true });
    try {
      const result = await blockchainService.storeNarrative(currentGameId, round, narrativeTexts);

      set({ isStoringNarrative: false });

      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });

      return result.narrativeId;
    } catch (error) {
      set({ isStoringNarrative: false });
      console.error('Failed to store narrative:', error);
      throw error;
    }
  },

  completeRound: async (eliminatedContestants: string[]) => {
    const { currentGameId } = get();
    if (!currentGameId) {
      throw new Error('No active game');
    }

    try {
      const result = await blockchainService.completeRound(currentGameId, eliminatedContestants);
      
      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });
      
      // Start monitoring transaction
      get().checkTransactionStatus(result.transactionHash);
    } catch (error) {
      console.error('Failed to complete round:', error);
      throw error;
    }
  },

  endGame: async (winnerId: string) => {
    const { currentGameId } = get();
    if (!currentGameId) {
      throw new Error('No active game');
    }

    try {
      const result = await blockchainService.endGame(currentGameId, winnerId);

      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });

      // Start monitoring transaction
      get().checkTransactionStatus(result.transactionHash);
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  },

  storeGameResults: async (winnerId: string, finalStats: any) => {
    const { currentGameId } = get();
    if (!currentGameId) {
      throw new Error('No active game');
    }

    try {
      const result = await blockchainService.storeGameResults(currentGameId, winnerId, finalStats);

      // Add pending transaction
      get().addPendingTransaction({
        hash: result.transactionHash,
        status: 'pending',
        confirmations: 0,
      });

      // Start monitoring transaction
      get().checkTransactionStatus(result.transactionHash);
    } catch (error) {
      console.error('Failed to store game results:', error);
      throw error;
    }
  },

  // Data fetching
  refreshGameState: async () => {
    const { currentGameId } = get();
    if (!currentGameId) return;

    try {
      const gameState = await blockchainService.getGameState(currentGameId);
      set({ onchainGameState: gameState });
    } catch (error) {
      console.error('Failed to refresh game state:', error);
    }
  },

  refreshUserBets: async () => {
    const { walletState } = get();
    if (!walletState.address) return;

    try {
      const bets = await blockchainService.getUserBets(walletState.address);
      set({ blockchainBets: bets });
    } catch (error) {
      console.error('Failed to refresh user bets:', error);
    }
  },

  checkTransactionStatus: async (txHash: string) => {
    try {
      const status = await blockchainService.getTransactionStatus(txHash);
      
      set(state => ({
        pendingTransactions: state.pendingTransactions.map(tx =>
          tx.hash === txHash ? status : tx
        )
      }));

      // If transaction is confirmed, refresh relevant data
      if (status.status === 'confirmed') {
        get().refreshGameState();
        get().refreshUserBets();
        
        // Remove from pending after a delay
        setTimeout(() => {
          get().removePendingTransaction(txHash);
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to check transaction status:', error);
    }
  },

  // Utility functions
  setCurrentGameId: (gameId: string) => {
    set({ currentGameId: gameId });
    blockchainService.setCurrentGameId(gameId);
  },

  addPendingTransaction: (tx: TransactionStatus) => {
    set(state => ({
      pendingTransactions: [...state.pendingTransactions, tx]
    }));
  },

  removePendingTransaction: (txHash: string) => {
    set(state => ({
      pendingTransactions: state.pendingTransactions.filter(tx => tx.hash !== txHash)
    }));
  },

  initializeContracts: async () => {
    try {
      await blockchainService.initializeContracts();
      console.log('Contracts initialized successfully');
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
      throw error;
    }
  },

  setAutoApproveTransactions: (enabled: boolean) => {
    set({ autoApproveTransactions: enabled });
  },

  setDisableRoundLogging: (disabled: boolean) => {
    set({ disableRoundLogging: disabled });
  },
}));

// Initialize wallet state listener
walletService.onWalletStateChange((walletState) => {
  useBlockchainStore.setState({ walletState });
});

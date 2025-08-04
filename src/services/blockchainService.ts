import { ethers } from 'ethers';
import { walletService } from './walletService';
import { BLOCKCHAIN_CONFIG, CURRENT_NETWORK } from '../config/blockchain';
import type { 
  BlockchainBet, 
  OnchainGameState, 
  OnchainNarrative, 
  TransactionStatus 
} from '../types/blockchain';

// Contract ABIs (simplified for now - will be generated from actual contracts)
const GAME_CONTRACT_ABI = [
  "function createGame(string[] contestantIds, string[] contestantNames, uint256 totalRounds) external returns (uint256)",
  "function placeBet(uint256 gameId, string contestantId, uint256 odds) external payable",
  "function completeRound(uint256 gameId, string[] eliminatedContestants) external",
  "function endGame(uint256 gameId, string winnerId) external",
  "function getGame(uint256 gameId) external view returns (tuple(uint256 gameId, uint256 currentRound, uint256 totalRounds, bool isActive, string winner, uint256 totalBetAmount, uint256 createdAt, uint256 completedAt, address creator))",
  "function getBet(uint256 betId) external view returns (tuple(uint256 betId, uint256 gameId, address bettor, string contestantId, uint256 amount, uint256 odds, uint256 potentialPayout, uint256 timestamp, uint8 status))",
  "function getUserBets(address user) external view returns (uint256[])",
  "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 totalRounds)",
  "event BetPlaced(uint256 indexed betId, uint256 indexed gameId, address indexed bettor, string contestantId, uint256 amount)",
  "event GameCompleted(uint256 indexed gameId, string winner, uint256 totalPayout)",
  "event BetResolved(uint256 indexed betId, uint8 status, uint256 payout)"
];

const NARRATIVE_CONTRACT_ABI = [
  "function addNarrative(uint256 gameId, uint256 round, string[] narrativeTexts) external returns (uint256)",
  "function addGameEvent(uint256 gameId, uint256 round, string eventType, string description, string[] involvedContestants) external returns (uint256)",
  "function getNarrative(uint256 narrativeId) external view returns (tuple(uint256 narrativeId, uint256 gameId, uint256 round, string[] narrativeTexts, uint256 timestamp, address submitter))",
  "function getGameNarratives(uint256 gameId) external view returns (uint256[])",
  "function getRoundNarratives(uint256 gameId, uint256 round) external view returns (uint256[])",
  "event NarrativeAdded(uint256 indexed narrativeId, uint256 indexed gameId, uint256 round, address submitter)"
];

class BlockchainService {
  private gameContract: ethers.Contract | null = null;
  private narrativeContract: ethers.Contract | null = null;
  private currentGameId: string | null = null;
  private currentRpcIndex: number = 0;

  constructor() {
    // Don't initialize contracts in constructor - wait for wallet connection
  }

  public async initializeContracts() {
    const provider = walletService.getProvider();
    const signer = walletService.getSigner();

    console.log('Initializing contracts...', {
      provider: !!provider,
      signer: !!signer,
      gameContract: BLOCKCHAIN_CONFIG.contracts.GAME_CONTRACT,
      narrativeContract: BLOCKCHAIN_CONFIG.contracts.NARRATIVE_CONTRACT
    });

    if (provider && signer && BLOCKCHAIN_CONFIG.contracts.GAME_CONTRACT) {
      this.gameContract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.contracts.GAME_CONTRACT,
        GAME_CONTRACT_ABI,
        signer
      );
      console.log('Game contract initialized:', this.gameContract.target);
    }

    if (provider && signer && BLOCKCHAIN_CONFIG.contracts.NARRATIVE_CONTRACT) {
      this.narrativeContract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.contracts.NARRATIVE_CONTRACT,
        NARRATIVE_CONTRACT_ABI,
        signer
      );
      console.log('Narrative contract initialized:', this.narrativeContract.target);
    }
  }

  // Check if contracts are properly initialized
  public areContractsInitialized(): boolean {
    return !!(this.gameContract && this.narrativeContract);
  }

  // Execute operation with single RPC endpoint
  private async executeOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      console.log(`Using RPC endpoint: ${CURRENT_NETWORK.rpcUrls[0]}`);
      const result = await operation();
      return result;
    } catch (error: any) {
      console.error(`RPC operation failed:`, error.message);
      throw error;
    }
  }

  // Get optimized gas settings
  private async getOptimizedGasSettings(estimatedGas?: bigint) {
    // Use proper gas settings for mainnet
    const gasPrice = '1000000000'; // 1 gwei for mainnet
    const maxGasLimit = 15000000; // High limit for complex game creation

    try {
      // Use estimated gas if available, but cap it at our max
      let gasLimit = estimatedGas ? Number(estimatedGas) : maxGasLimit;

      // Add small buffer but cap at our maximum
      gasLimit = Math.min(Math.floor(gasLimit * 1.1), maxGasLimit);

      console.log('Optimized gas settings:', {
        gasLimit,
        gasPrice: gasPrice,
        estimatedGas: estimatedGas?.toString()
      });

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: gasPrice
      };
    } catch (error) {
      console.warn('Failed to get optimized gas settings, using defaults:', error);
      return {
        gasLimit: maxGasLimit.toString(),
        gasPrice: gasPrice
      };
    }
  }

  // Create a new game onchain
  async createGame(
    contestantIds: string[],
    contestantNames: string[],
    totalRounds: number
  ): Promise<{ gameId: string; transactionHash: string }> {
    if (!this.gameContract) {
      console.error('Game contract not initialized. Attempting to initialize...');
      await this.initializeContracts();
      if (!this.gameContract) {
        throw new Error('Game contract not initialized. Please ensure wallet is connected to Etherlink testnet.');
      }
    }

    // Execute with single RPC endpoint
    return await this.executeOperation(async () => {
      // Estimate gas for this specific transaction
      let estimatedGas: bigint | undefined;
      try {
        estimatedGas = await this.gameContract!.createGame.estimateGas(
          contestantIds,
          contestantNames,
          totalRounds
        );
      } catch (error) {
        console.warn('Gas estimation failed, using default:', error);
      }

      const gasSettings = await this.getOptimizedGasSettings(estimatedGas);

      console.log('Creating game with optimized params:', {
        contestantIds: contestantIds.length,
        contestantNames: contestantNames.length,
        totalRounds,
        estimatedGas: estimatedGas?.toString(),
        gasLimit: gasSettings.gasLimit,
        gasPrice: gasSettings.gasPrice
      });

      const tx = await this.gameContract!.createGame(
        contestantIds,
        contestantNames,
        totalRounds,
        gasSettings
      );

      console.log('Transaction sent:', tx.hash);

      // Add retry logic for rate limiting with exponential backoff
      let receipt;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          receipt = await tx.wait();
          console.log('Transaction confirmed:', receipt);
          break;
        } catch (error: any) {
          if (error.message?.includes('rate limited') && retries < maxRetries - 1) {
            const waitTime = Math.pow(2, retries) * 1000; // Exponential backoff
            console.log(`Rate limited, retrying in ${waitTime/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
          } else {
            throw error;
          }
        }
      }
      
      // Extract game ID from event logs
      const gameCreatedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('GameCreated(uint256,address,uint256)')
      );
      
      if (!gameCreatedEvent) {
        throw new Error('GameCreated event not found');
      }

      const gameId = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        gameCreatedEvent.topics[1]
      )[0].toString();

      this.currentGameId = gameId;

      return {
        gameId,
        transactionHash: tx.hash
      };
    }).catch((error: any) => {
      console.error('Failed to create game:', error);

      // Handle rate limiting specifically
      if (error.message?.includes('rate limited')) {
        throw new Error('⏳ RPC endpoint is rate limited. Please wait 30 seconds and try again.');
      }

      // Provide more specific error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient XTZ balance for gas fees. Please add more XTZ to your wallet.');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Gas estimation failed. The contract may have an issue or you may not have enough XTZ.');
      } else if (error.message?.includes('user rejected')) {
        throw new Error('Transaction was rejected in MetaMask.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your connection to Etherlink.');
      } else {
        throw new Error(`Failed to create game: ${error.message || 'Unknown error'}`);
      }
    });
  }

  // Place a bet onchain
  async placeBet(
    gameId: string,
    contestantId: string,
    amount: string, // Amount in AVAX
    odds: number
  ): Promise<{ betId: string; transactionHash: string }> {
    if (!this.gameContract) {
      throw new Error('Game contract not initialized');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const oddsScaled = Math.floor(odds * 100); // Convert to scaled integer

      // Estimate gas for betting transaction
      let estimatedGas: bigint | undefined;
      try {
        estimatedGas = await this.gameContract.placeBet.estimateGas(
          gameId,
          contestantId,
          oddsScaled,
          { value: amountWei }
        );
      } catch (error) {
        console.warn('Gas estimation failed for bet, using default:', error);
      }

      const gasSettings = await this.getOptimizedGasSettings(estimatedGas);

      console.log('Placing bet with optimized gas:', {
        gameId,
        contestantId,
        amount,
        estimatedGas: estimatedGas?.toString(),
        gasLimit: gasSettings.gasLimit,
        gasPrice: gasSettings.gasPrice
      });

      const tx = await this.gameContract.placeBet(
        gameId,
        contestantId,
        oddsScaled,
        {
          value: amountWei,
          ...gasSettings
        }
      );

      const receipt = await tx.wait();
      
      // Extract bet ID from event logs
      const betPlacedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('BetPlaced(uint256,uint256,address,string,uint256)')
      );
      
      if (!betPlacedEvent) {
        throw new Error('BetPlaced event not found');
      }

      const betId = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        betPlacedEvent.topics[1]
      )[0].toString();

      return {
        betId,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Failed to place bet:', error);
      throw new Error(`Failed to place bet: ${error.message}`);
    }
  }

  // Store narrative onchain
  async storeNarrative(
    gameId: string,
    round: number,
    narrativeTexts: string[]
  ): Promise<{ narrativeId: string; transactionHash: string }> {
    if (!this.narrativeContract) {
      throw new Error('Narrative contract not initialized');
    }

    try {
      const tx = await this.narrativeContract.addNarrative(
        gameId,
        round,
        narrativeTexts,
        {
          gasLimit: BLOCKCHAIN_CONFIG.gasLimit,
          gasPrice: BLOCKCHAIN_CONFIG.gasPrice
        }
      );

      const receipt = await tx.wait();
      
      // Extract narrative ID from event logs
      const narrativeAddedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('NarrativeAdded(uint256,uint256,uint256,address)')
      );
      
      if (!narrativeAddedEvent) {
        throw new Error('NarrativeAdded event not found');
      }

      const narrativeId = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        narrativeAddedEvent.topics[1]
      )[0].toString();

      return {
        narrativeId,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Failed to store narrative:', error);
      throw new Error(`Failed to store narrative: ${error.message}`);
    }
  }

  // Complete a round onchain
  async completeRound(
    gameId: string,
    eliminatedContestants: string[]
  ): Promise<{ transactionHash: string }> {
    if (!this.gameContract) {
      throw new Error('Game contract not initialized');
    }

    try {
      const tx = await this.gameContract.completeRound(
        gameId,
        eliminatedContestants,
        {
          gasLimit: BLOCKCHAIN_CONFIG.gasLimit,
          gasPrice: BLOCKCHAIN_CONFIG.gasPrice
        }
      );

      await tx.wait();

      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Failed to complete round:', error);
      throw new Error(`Failed to complete round: ${error.message}`);
    }
  }

  // End game and declare winner
  async endGame(
    gameId: string,
    winnerId: string
  ): Promise<{ transactionHash: string }> {
    if (!this.gameContract) {
      throw new Error('Game contract not initialized');
    }

    try {
      const tx = await this.gameContract.endGame(gameId, winnerId, {
        gasLimit: BLOCKCHAIN_CONFIG.gasLimit,
        gasPrice: BLOCKCHAIN_CONFIG.gasPrice
      });

      await tx.wait();

      return {
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Failed to end game:', error);
      throw new Error(`Failed to end game: ${error.message}`);
    }
  }

  // Store game results onchain (including final stats and betting outcomes)
  async storeGameResults(
    gameId: string,
    winnerId: string,
    finalStats: {
      totalRounds: number;
      totalBets: number;
      totalBetAmount: string;
      winningBets: number;
      totalPayout: string;
    }
  ): Promise<{ narrativeId: string; transactionHash: string }> {
    if (!this.narrativeContract) {
      throw new Error('Narrative contract not initialized');
    }

    try {
      const resultTexts = [
        '🏆 FINAL GAME RESULTS 🏆',
        `Game ID: ${gameId}`,
        `Winner: Contestant ${winnerId}`,
        `Total Rounds Completed: ${finalStats.totalRounds}`,
        `Total Bets Placed: ${finalStats.totalBets}`,
        `Total Bet Amount: ${finalStats.totalBetAmount} AVAX`,
        `Winning Bets: ${finalStats.winningBets}`,
        `Total Payout: ${finalStats.totalPayout} AVAX`,
        `Game completed at: ${new Date().toISOString()}`
      ];

      const tx = await this.narrativeContract.addNarrative(
        gameId,
        1000, // Use round 1000 for final results
        resultTexts,
        {
          gasLimit: BLOCKCHAIN_CONFIG.gasLimit,
          gasPrice: BLOCKCHAIN_CONFIG.gasPrice
        }
      );

      const receipt = await tx.wait();

      // Extract narrative ID from event logs
      const narrativeAddedEvent = receipt.logs.find((log: any) =>
        log.topics[0] === ethers.id('NarrativeAdded(uint256,uint256,uint256,address)')
      );

      if (!narrativeAddedEvent) {
        throw new Error('NarrativeAdded event not found');
      }

      const narrativeId = ethers.AbiCoder.defaultAbiCoder().decode(
        ['uint256'],
        narrativeAddedEvent.topics[1]
      )[0].toString();

      return {
        narrativeId,
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Failed to store game results:', error);
      throw new Error(`Failed to store game results: ${error.message}`);
    }
  }

  // Get game state from blockchain
  async getGameState(gameId: string): Promise<OnchainGameState> {
    if (!this.gameContract) {
      throw new Error('Game contract not initialized');
    }

    try {
      const gameData = await this.gameContract.getGame(gameId);
      
      return {
        gameId: gameData.gameId.toString(),
        currentRound: Number(gameData.currentRound),
        totalRounds: Number(gameData.totalRounds),
        isActive: gameData.isActive,
        winner: gameData.winner || undefined,
        totalBetAmount: ethers.formatEther(gameData.totalBetAmount),
        createdAt: new Date(Number(gameData.createdAt) * 1000),
        completedAt: gameData.completedAt > 0 ? new Date(Number(gameData.completedAt) * 1000) : undefined,
        transactionHash: '' // This would need to be stored separately
      };
    } catch (error: any) {
      console.error('Failed to get game state:', error);
      throw new Error(`Failed to get game state: ${error.message}`);
    }
  }

  // Get user's bets
  async getUserBets(userAddress: string): Promise<BlockchainBet[]> {
    if (!this.gameContract) {
      console.error('Game contract not initialized. Attempting to initialize...');
      await this.initializeContracts();
      if (!this.gameContract) {
        throw new Error('Game contract not initialized. Please ensure wallet is connected to Avalanche testnet.');
      }
    }

    try {
      const betIds = await this.gameContract.getUserBets(userAddress);
      const bets: BlockchainBet[] = [];

      for (const betId of betIds) {
        const betData = await this.gameContract.getBet(betId);
        
        bets.push({
          id: betData.betId.toString(),
          contestantId: betData.contestantId,
          amount: ethers.formatEther(betData.amount),
          odds: Number(betData.odds) / 100, // Convert back from scaled integer
          potentialPayout: ethers.formatEther(betData.potentialPayout),
          timestamp: new Date(Number(betData.timestamp) * 1000),
          status: this.mapBetStatus(betData.status),
          transactionHash: '', // This would need to be stored separately
        });
      }

      return bets;
    } catch (error: any) {
      console.error('Failed to get user bets:', error);
      throw new Error(`Failed to get user bets: ${error.message}`);
    }
  }

  private mapBetStatus(status: number): 'pending' | 'confirmed' | 'won' | 'lost' {
    switch (status) {
      case 0: return 'confirmed'; // Active
      case 1: return 'won';
      case 2: return 'lost';
      case 3: return 'pending'; // Cancelled
      default: return 'pending';
    }
  }

  // Get current game ID
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  // Set current game ID
  setCurrentGameId(gameId: string): void {
    this.currentGameId = gameId;
  }

  // Check transaction status
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    const provider = walletService.getProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }

    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return {
          hash: txHash,
          status: 'failed',
          confirmations: 0,
          error: 'Transaction not found'
        };
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return {
          hash: txHash,
          status: 'pending',
          confirmations: 0
        };
      }

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return {
        hash: txHash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmations,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      return {
        hash: txHash,
        status: 'failed',
        confirmations: 0,
        error: error.message
      };
    }
  }
}

export const blockchainService = new BlockchainService();

import { blockchainService } from './blockchainService';
import { useBlockchainStore } from '../stores/blockchainStore';

/**
 * Service for logging game narratives and events to the blockchain
 */
class NarrativeLogger {
  private isEnabled: boolean = false;
  private currentGameId: string | null = null;

  /**
   * Enable blockchain narrative logging
   */
  enable(gameId: string) {
    this.isEnabled = true;
    this.currentGameId = gameId;
  }

  /**
   * Disable blockchain narrative logging
   */
  disable() {
    this.isEnabled = false;
    this.currentGameId = null;
  }

  /**
   * Check if narrative logging is enabled and ready
   */
  isReady(): boolean {
    return this.isEnabled && this.currentGameId !== null;
  }

  /**
   * Log round narrative to blockchain
   */
  async logRoundNarrative(
    round: number,
    narrativeTexts: string[]
  ): Promise<string | null> {
    if (!this.isReady() || !this.currentGameId) {
      console.log('Narrative logging not enabled or no game ID');
      return null;
    }

    try {
      console.log(`Logging narrative for round ${round} to blockchain...`);
      
      // Filter out empty narratives
      const validNarratives = narrativeTexts.filter(text => text.trim().length > 0);
      
      if (validNarratives.length === 0) {
        console.log('No valid narratives to log');
        return null;
      }

      // Store narrative onchain using the blockchain store
      const store = useBlockchainStore.getState();
      const narrativeId = await store.storeNarrative(round, validNarratives);
      
      console.log(`Narrative logged successfully with ID: ${narrativeId}`);
      return narrativeId;
    } catch (error) {
      console.error('Failed to log narrative to blockchain:', error);
      // Don't throw error - narrative logging failure shouldn't break the game
      return null;
    }
  }

  /**
   * Log game event to blockchain
   */
  async logGameEvent(
    round: number,
    eventType: string,
    description: string,
    involvedContestants: string[]
  ): Promise<string | null> {
    if (!this.isReady() || !this.currentGameId) {
      console.log('Event logging not enabled or no game ID');
      return null;
    }

    try {
      console.log(`Logging game event "${eventType}" for round ${round} to blockchain...`);
      
      const result = await blockchainService.storeNarrative(
        this.currentGameId,
        round,
        [`[EVENT: ${eventType}] ${description}`]
      );
      
      console.log(`Game event logged successfully with ID: ${result.narrativeId}`);
      return result.narrativeId;
    } catch (error) {
      console.error('Failed to log game event to blockchain:', error);
      // Don't throw error - event logging failure shouldn't break the game
      return null;
    }
  }

  /**
   * Log multiple narratives in batch (more gas efficient)
   */
  async logBatchNarratives(
    round: number,
    narrativeBatches: string[][]
  ): Promise<string[]> {
    if (!this.isReady() || !this.currentGameId) {
      console.log('Batch narrative logging not enabled or no game ID');
      return [];
    }

    const narrativeIds: string[] = [];

    for (const batch of narrativeBatches) {
      try {
        const narrativeId = await this.logRoundNarrative(round, batch);
        if (narrativeId) {
          narrativeIds.push(narrativeId);
        }
      } catch (error) {
        console.error('Failed to log narrative batch:', error);
        // Continue with other batches even if one fails
      }
    }

    return narrativeIds;
  }

  /**
   * Log elimination events specifically
   */
  async logEliminations(
    round: number,
    eliminatedContestants: string[],
    eliminationNarrative: string[]
  ): Promise<string | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      // Combine elimination info with narrative
      const eliminationTexts = [
        `Round ${round} Eliminations:`,
        ...eliminatedContestants.map(id => `- Contestant ${id} eliminated`),
        '',
        ...eliminationNarrative
      ];

      return await this.logRoundNarrative(round, eliminationTexts);
    } catch (error) {
      console.error('Failed to log eliminations:', error);
      return null;
    }
  }

  /**
   * Log game completion
   */
  async logGameCompletion(
    winnerId: string,
    finalNarrative: string[]
  ): Promise<string | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const completionTexts = [
        'GAME COMPLETED',
        `Winner: Contestant ${winnerId}`,
        '',
        ...finalNarrative
      ];

      return await this.logRoundNarrative(999, completionTexts); // Use round 999 for completion
    } catch (error) {
      console.error('Failed to log game completion:', error);
      return null;
    }
  }

  /**
   * Get current game ID
   */
  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  /**
   * Check if blockchain narrative logging is available
   */
  isBlockchainAvailable(): boolean {
    const store = useBlockchainStore.getState();
    return store.walletState.isConnected && store.walletState.isCorrectNetwork;
  }
}

// Export singleton instance
export const narrativeLogger = new NarrativeLogger();

// Helper function to conditionally enable narrative logging based on blockchain state
export function enableNarrativeLoggingIfAvailable(gameId: string): boolean {
  const store = useBlockchainStore.getState();
  
  if (store.walletState.isConnected && store.walletState.isCorrectNetwork && store.currentGameId) {
    narrativeLogger.enable(gameId);
    console.log('Blockchain narrative logging enabled for game:', gameId);
    return true;
  } else {
    console.log('Blockchain narrative logging not available - wallet not connected or wrong network');
    return false;
  }
}

// Helper function to safely log narratives (won't throw errors)
export async function safeLogNarrative(
  round: number,
  narrativeTexts: string[]
): Promise<void> {
  try {
    await narrativeLogger.logRoundNarrative(round, narrativeTexts);
  } catch (error) {
    console.error('Safe narrative logging failed:', error);
    // Silently fail - don't disrupt game flow
  }
}

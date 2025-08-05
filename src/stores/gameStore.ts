import { create } from 'zustand';
import type { GameState, Contestant, GameEvent, BettingState, UIState, GamePhase } from '../types/index';
import { initializeContestants } from '../data/contestants';
import { GAME_ROUNDS } from '../data/gameRounds';
import { simulateRound } from '../utils/gameEngine';
import { initializeBettingState, resolveBets, resolveBetsWithSurvivors, calculateDynamicOdds, placeBet as placeBetUtil, cancelBet as cancelBetUtil } from '../utils/bettingSystem';
import { makeAIDecision } from '../utils/aiDecisionEngine';
import { narrativeLogger, enableNarrativeLoggingIfAvailable, safeLogNarrative } from '../services/narrativeLogger';
import { useBlockchainStore } from './blockchainStore';

interface GameStore {
  // Game State
  gameState: GameState;
  bettingState: BettingState;
  uiState: UIState;

  // Exposed properties for easy access
  contestants: Contestant[];

  // Actions
  initializeGame: () => void;
  startGame: () => void;
  startSimulation: () => void;
  simulateNextRound: () => void;
  nextRound: () => void;
  resetGame: () => void;
  enableBlockchainLogging: (gameId: string) => void;

  // UI Actions
  setGamePhase: (phase: GamePhase) => void;
  selectContestant: (contestantId: string) => void;
  toggleContestantDetails: () => void;
  closeContestantDetails: () => void;
  toggleAutoAdvance: () => void;
  setSimulationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  showResults: () => void;

  // Narrative timing controls
  startRoundNarrative: () => void;
  completeNarrative: () => void;
  showRoundEliminations: () => void;
  resetRoundState: () => void;

  // Betting Actions
  placeBet: (contestantId: string, amount: number) => { success: boolean; message: string };
  cancelBet: (betId: string) => { success: boolean; message: string };

  // Game Progress
  isGameComplete: () => boolean;
  getCurrentRound: () => number;
  getAliveContestants: () => Contestant[];
  getWinner: () => Contestant | undefined;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: {
    currentRound: 0,
    totalRounds: GAME_ROUNDS.length,
    contestants: [],
    eliminatedContestants: [],
    rounds: GAME_ROUNDS,
    roundNarrative: [],
    gameEvents: []
  },

  bettingState: initializeBettingState(),

  uiState: {
    currentPhase: 'intro',
    showContestantDetails: false,
    simulationSpeed: 'normal',
    autoAdvance: false,
    roundInProgress: false,
    showEliminations: false,
    narrativeComplete: false
  },

  // Exposed contestants property
  get contestants() {
    return get().gameState.contestants;
  },
  
  // Initialize game with contestants
  initializeGame: () => {
    const contestants = initializeContestants();
    set({
      gameState: {
        currentRound: 0,
        totalRounds: GAME_ROUNDS.length,
        contestants,
        eliminatedContestants: [],
        rounds: GAME_ROUNDS,
        currentRoundData: GAME_ROUNDS[0],
        roundNarrative: [],
        gameEvents: []
      },
      bettingState: initializeBettingState(),
      uiState: {
        currentPhase: 'intro',
        showContestantDetails: false,
        simulationSpeed: 'normal',
        autoAdvance: false,
        roundInProgress: false,
        showEliminations: false,
        narrativeComplete: false
      }
    });
  },
  
  // Start the game (move to betting phase)
  startGame: () => {
    set(state => ({
      uiState: { ...state.uiState, currentPhase: 'betting' }
    }));
  },

  // Start simulation phase
  startSimulation: () => {
    set(state => ({
      uiState: { ...state.uiState, currentPhase: 'simulation' }
    }));
  },

  // Advance to next round (alias for simulateNextRound)
  nextRound: () => {
    get().simulateNextRound();
  },

  // Enable blockchain narrative logging for the current game
  enableBlockchainLogging: (gameId: string) => {
    enableNarrativeLoggingIfAvailable(gameId);
  },
  
  // Simulate the next round
  simulateNextRound: async () => {
    const state = get();
    const { gameState } = state;

    if (gameState.currentRound >= gameState.totalRounds) {
      return; // Game is already complete
    }

    const currentRound = gameState.rounds[gameState.currentRound];
    const aliveContestants = gameState.contestants.filter(c => c.status === 'alive');

    if (aliveContestants.length <= 1) {
      // Game over - declare winner
      const winner = aliveContestants[0];
      if (winner) {
        winner.status = 'winner';
      }

      const newBettingState = winner ? resolveBets(state.bettingState, winner) : state.bettingState;

      set({
        gameState: {
          ...gameState,
          winner,
          contestants: gameState.contestants.map(c =>
            c.id === winner?.id ? { ...c, status: 'winner' as const } : c
          )
        },
        bettingState: newBettingState,
        uiState: { ...state.uiState, currentPhase: 'game-over' }
      });
      return;
    }

    // Start the round narrative (but don't show eliminations yet)
    get().startRoundNarrative();
    
    // Generate AI decisions for this round
    const aiDecisions = aliveContestants.map(contestant => ({
      contestant,
      decision: makeAIDecision({
        contestant,
        currentRound,
        remainingContestants: aliveContestants,
        roundNumber: gameState.currentRound + 1,
        gameEvents: gameState.gameEvents
      })
    }));

    // Simulate the round (now async)
    const roundResult = await simulateRound(
      gameState.contestants,
      currentRound,
      gameState.currentRound + 1
    );

    // Log round narrative to blockchain if enabled
    const roundNumber = gameState.currentRound + 1;
    if (narrativeLogger.isReady()) {
      await safeLogNarrative(roundNumber, roundResult.narrative);
    }

    // Separate narrative into setup and elimination parts
    const setupNarrative = roundResult.narrative.filter(text =>
      !text.includes('eliminated') && !text.includes('falls') && !text.includes('dies')
    );
    const eliminationNarrative = roundResult.narrative.filter(text =>
      text.includes('eliminated') || text.includes('falls') || text.includes('dies')
    );

    const newRoundNumber = gameState.currentRound + 1;
    const nextRoundData = newRoundNumber < gameState.totalRounds ?
      gameState.rounds[newRoundNumber] : undefined;

    // Create new game events
    const newEvents: GameEvent[] = [
      ...gameState.gameEvents,
      ...roundResult.events,
      ...aiDecisions.map(({ contestant, decision }) => ({
        id: `decision-${contestant.id}-${gameState.currentRound + 1}`,
        round: gameState.currentRound + 1,
        type: 'random' as const,
        description: `${contestant.name}: ${decision.action}`,
        involvedContestants: [contestant.id],
        timestamp: new Date()
      }))
    ];

    // First, update with just the setup narrative (no eliminations shown yet)
    // Clear previous round narrative and start fresh for this round
    set({
      gameState: {
        ...gameState,
        currentRound: newRoundNumber,
        currentRoundData: nextRoundData,
        roundNarrative: setupNarrative, // Start fresh with only current round narrative
        gameEvents: newEvents,
        // Store round results temporarily (not visible to UI yet)
        pendingRoundResult: {
          survivors: roundResult.survivors,
          eliminated: roundResult.eliminated,
          eliminationNarrative
        }
      },
      uiState: {
        ...state.uiState,
        currentPhase: 'simulation',
        roundInProgress: true,
        showEliminations: false,
        narrativeComplete: false
      }
    });
  },
  
  // Reset game to initial state
  resetGame: () => {
    get().initializeGame();
  },
  
  // UI Actions
  setGamePhase: (phase: GamePhase) => {
    set(state => ({
      uiState: { ...state.uiState, currentPhase: phase }
    }));
  },
  
  selectContestant: (contestantId: string) => {
    set(state => ({
      uiState: { 
        ...state.uiState, 
        selectedContestant: contestantId,
        showContestantDetails: true
      }
    }));
  },
  
  toggleContestantDetails: () => {
    set(state => ({
      uiState: {
        ...state.uiState,
        showContestantDetails: !state.uiState.showContestantDetails
      }
    }));
  },

  closeContestantDetails: () => {
    set(state => ({
      uiState: {
        ...state.uiState,
        showContestantDetails: false,
        selectedContestant: undefined
      }
    }));
  },

  toggleAutoAdvance: () => {
    set(state => ({
      uiState: {
        ...state.uiState,
        autoAdvance: !state.uiState.autoAdvance
      }
    }));
  },
  
  setSimulationSpeed: (speed: 'slow' | 'normal' | 'fast') => {
    set(state => ({
      uiState: { ...state.uiState, simulationSpeed: speed }
    }));
  },

  showResults: () => {
    set(state => ({
      uiState: { ...state.uiState, currentPhase: 'results' }
    }));
  },
  
  // Betting Actions
  placeBet: (contestantId: string, amount: number) => {
    const state = get();
    const contestant = state.gameState.contestants.find(c => c.id === contestantId);

    if (!contestant) {
      return { success: false, message: 'Contestant not found' };
    }

    const result = placeBetUtil(state.bettingState, contestantId, amount, contestant.currentOdds);

    if (result.success && result.newState) {
      set(prevState => ({
        bettingState: result.newState!
      }));
      return { success: true, message: 'Bet placed' };
    }

    return { success: false, message: result.message || 'Failed to place bet' };
  },

  cancelBet: (betId: string) => {
    const state = get();
    const result = cancelBetUtil(state.bettingState, betId);

    if (result.success && result.newState) {
      set(prevState => ({
        bettingState: result.newState!
      }));
      return { success: true, message: 'Bet cancelled' };
    }

    return { success: false, message: result.message || 'Failed to cancel bet' };
  },
  
  // Helper functions
  isGameComplete: () => {
    const state = get();
    return state.gameState.currentRound >= state.gameState.totalRounds || 
           state.gameState.contestants.filter(c => c.status === 'alive').length <= 1;
  },
  
  getCurrentRound: () => {
    return get().gameState.currentRound;
  },
  
  getAliveContestants: () => {
    return get().gameState.contestants.filter(c => c.status === 'alive');
  },
  
  getWinner: () => {
    return get().gameState.winner;
  },

  // Narrative timing controls
  startRoundNarrative: () => {
    set(state => ({
      uiState: {
        ...state.uiState,
        roundInProgress: true,
        showEliminations: false,
        narrativeComplete: false
      }
    }));
  },

  completeNarrative: () => {
    const state = get();
    const { pendingRoundResult } = state.gameState;

    if (!pendingRoundResult) return;

    // Add elimination narrative to the current round narrative
    set({
      gameState: {
        ...state.gameState,
        roundNarrative: [
          ...state.gameState.roundNarrative,
          ...pendingRoundResult.eliminationNarrative
        ]
      },
      uiState: {
        ...state.uiState,
        narrativeComplete: true
      }
    });

    // After a short delay, show the eliminations
    setTimeout(() => {
      get().showRoundEliminations();
    }, 1000);
  },

  showRoundEliminations: () => {
    const state = get();
    const { pendingRoundResult } = state.gameState;

    if (!pendingRoundResult) return;

    // Update contestants with round results and show eliminations
    const updatedContestants = state.gameState.contestants.map(contestant => {
      const survivor = pendingRoundResult.survivors.find(s => s.id === contestant.id);
      const eliminated = pendingRoundResult.eliminated.find(e => e.id === contestant.id);

      if (survivor) return survivor;
      if (eliminated) return eliminated;
      return contestant;
    });

    // Update odds for remaining contestants
    const contestantsWithUpdatedOdds = calculateDynamicOdds(
      updatedContestants,
      state.gameState.currentRound,
      state.gameState.totalRounds
    );

    set({
      gameState: {
        ...state.gameState,
        contestants: contestantsWithUpdatedOdds,
        eliminatedContestants: [
          ...state.gameState.eliminatedContestants,
          ...pendingRoundResult.eliminated
        ],
        pendingRoundResult: undefined // Clear pending results
      },
      uiState: {
        ...state.uiState,
        showEliminations: true,
        roundInProgress: false
      }
    });

    // Check if game is complete after this round
    const remainingAlive = contestantsWithUpdatedOdds.filter(c => c.status === 'alive');
    const currentState = get();
    const isLastRound = currentState.gameState.currentRound >= currentState.gameState.totalRounds;

    if (remainingAlive.length === 1 || isLastRound) {
      // Game is complete - either we have a winner or we've finished all rounds
      setTimeout(() => {
        // Handle multiple survivors properly
        const survivors = remainingAlive.length > 0 ? remainingAlive : [];
        const winner = remainingAlive.length === 1 ? remainingAlive[0] : undefined;

        // Mark all survivors as winners if multiple, or single winner
        if (remainingAlive.length === 1) {
          remainingAlive[0].status = 'winner';
        } else if (remainingAlive.length > 1) {
          // Multiple survivors - mark them all as winners
          remainingAlive.forEach(survivor => {
            survivor.status = 'winner';
          });
        }

        // Resolve bets with all survivors (handles both single winner and multiple survivors)
        const finalBettingState = survivors.length > 0 ?
          resolveBetsWithSurvivors(get().bettingState, survivors) :
          get().bettingState;

        // Log game completion and store results onchain if enabled
        if (narrativeLogger.isReady() && winner) {
          const completionNarrative = [
            `🏆 GAME COMPLETED! 🏆`,
            `Winner: ${winner.name} (#${winner.number || 'Unknown'})`,
            `Survived all ${get().gameState.totalRounds} rounds`,
            `Final stats: Strength ${winner.stats.strength}, Speed ${winner.stats.speed || winner.stats.agility}, Intelligence ${winner.stats.intelligence}, Luck ${winner.stats.luck}`
          ];
          safeLogNarrative(999, completionNarrative); // Use round 999 for completion

          // Store final game results onchain
          const blockchainStore = useBlockchainStore.getState();
          if (blockchainStore.currentGameId) {
            const finalStats = {
              totalRounds: get().gameState.totalRounds,
              totalBets: finalBettingState.bettingHistory.length,
              totalBetAmount: finalBettingState.bettingHistory.reduce((sum, bet) => sum + bet.amount, 0).toString(),
              winningBets: finalBettingState.bettingHistory.filter(bet => bet.status === 'won').length,
              totalPayout: finalBettingState.totalWinnings.toString()
            };

            try {
              blockchainStore.storeGameResults(winner.id, finalStats);
              blockchainStore.endGame(winner.id);
            } catch (error) {
              console.error('Failed to store results onchain:', error);
            }
          }
        }

        set(state => ({
          gameState: {
            ...state.gameState,
            winner, // Keep single winner for backwards compatibility
            survivors, // Add survivors list for multiple winners
            contestants: state.gameState.contestants.map(c => {
              const isWinner = survivors.some(s => s.id === c.id);
              return isWinner ? { ...c, status: 'winner' as const } : c;
            })
          },
          bettingState: finalBettingState,
          uiState: { ...state.uiState, currentPhase: 'results' } // Go to results instead of game-over
        }));
      }, 2000);
    }
  },

  resetRoundState: () => {
    set(state => ({
      uiState: {
        ...state.uiState,
        roundInProgress: false,
        showEliminations: false,
        narrativeComplete: false
      },
      gameState: {
        ...state.gameState,
        pendingRoundResult: undefined,
        roundNarrative: [] // Clear narrative for next round
      }
    }));
  }
}));

// Core game types
export type PersonalityType = 
  | 'Cautious' 
  | 'Ambitious' 
  | 'Loyal' 
  | 'Calculating' 
  | 'Reckless' 
  | 'Empathetic' 
  | 'Aggressive' 
  | 'Lucky' 
  | 'Deceptive' 
  | 'Resourceful';

export type TraitType = 
  | 'Survivor' 
  | 'Opportunist' 
  | 'Protector' 
  | 'Strategist' 
  | 'Daredevil' 
  | 'Peacemaker' 
  | 'Challenger' 
  | 'Fortunate' 
  | 'Liar' 
  | 'Improviser';

export type GameRoundType = 
  | 'Red Light Green Light' 
  | 'Tug of War' 
  | 'Marbles' 
  | 'Glass Bridge' 
  | 'Final Squid Game';

export type ContestantStatus = 'alive' | 'eliminated' | 'winner';

export interface Contestant {
  id: string;
  name: string;
  number?: number;  // Contestant number for display
  imageUrl?: string;  // Profile image URL
  personality: PersonalityType;
  trait: TraitType;
  description: string;
  status: ContestantStatus;
  
  // Stats that affect gameplay
  stats: {
    strength: number;      // 1-10, affects physical challenges
    intelligence: number;  // 1-10, affects strategic decisions
    luck: number;         // 1-10, affects random events
    charisma: number;     // 1-10, affects alliances
    agility: number;      // 1-10, affects speed-based challenges
    speed: number;        // 1-10, affects speed-based challenges (alias for agility)
    deception: number;    // 1-10, affects bluffing and manipulation
  };
  
  // Relationships with other contestants
  relationships: {
    allies: string[];     // IDs of allied contestants
    enemies: string[];    // IDs of enemy contestants
    neutral: string[];    // IDs of neutral contestants
  };
  
  // Game history
  roundsParticipated: GameRoundType[];
  eliminationRound?: GameRoundType;
  
  // Betting information
  currentOdds: number;   // Decimal odds (e.g., 2.5 means 2.5:1)
  totalBetsPlaced: number;
}

export interface GameRound {
  type: GameRoundType;
  name: string;
  description: string;
  eliminationCount: number;  // How many contestants are eliminated
  
  // Which stats are most important for this round
  primaryStats: (keyof Contestant['stats'])[];
  secondaryStats: (keyof Contestant['stats'])[];
  
  // Special rules or modifiers
  allowsAlliances: boolean;
  requiresTeamwork: boolean;
  hasRandomElement: boolean;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  contestants: Contestant[];
  eliminatedContestants: Contestant[];
  winner?: Contestant;
  survivors?: Contestant[]; // All final survivors (for multiple winners)
  
  // Game progression
  rounds: GameRound[];
  currentRoundData?: GameRound;
  
  // Narrative elements
  roundNarrative: string[];
  gameEvents: GameEvent[];

  // Pending round results (for timing control)
  pendingRoundResult?: {
    survivors: Contestant[];
    eliminated: Contestant[];
    eliminationNarrative: string[];
  };
}

export interface GameEvent {
  id: string;
  round: number;
  type: 'elimination' | 'alliance' | 'betrayal' | 'conflict' | 'random';
  description: string;
  involvedContestants: string[];
  timestamp: Date;
}

export interface Bet {
  id: string;
  contestantId: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  timestamp: Date;
  status: 'active' | 'won' | 'lost';
  actualPayout?: number; // For split payouts
  splitReason?: string; // Explanation for split (e.g., "Split among 3 survivors")
}

export interface BettingState {
  userBalance: number;
  activeBets: Bet[];
  bettingHistory: Bet[];
  totalWinnings: number;
  totalLosses: number;
}

// AI Decision making types
export interface DecisionContext {
  contestant: Contestant;
  currentRound: GameRound;
  remainingContestants: Contestant[];
  roundNumber: number;
  gameEvents: GameEvent[];
}

export interface AIDecision {
  action: string;
  reasoning: string;
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high';
}

// UI State types
export type GamePhase = 'intro' | 'betting' | 'simulation' | 'results' | 'game-over';

export interface UIState {
  currentPhase: GamePhase;
  selectedContestant?: string;
  showContestantDetails: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  autoAdvance: boolean;
  roundInProgress: boolean;
  showEliminations: boolean;
  narrativeComplete: boolean;
}

// Re-export blockchain types for convenience
export type {
  WalletState,
  BlockchainBet,
  OnchainGameState,
  OnchainNarrative,
  TransactionStatus
} from './blockchain';

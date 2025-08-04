import type { GameRound } from '../types/index';

export const GAME_ROUNDS: GameRound[] = [
  {
    type: 'Red Light Green Light',
    name: 'Red Light, Green Light',
    description: 'Players must reach the finish line while a giant doll is facing away. When it turns around, anyone still moving is eliminated.',
    eliminationCount: 2,
    primaryStats: ['agility', 'intelligence'],
    secondaryStats: ['luck'],
    allowsAlliances: false,
    requiresTeamwork: false,
    hasRandomElement: true
  },
  {
    type: 'Tug of War',
    name: 'Tug of War',
    description: 'Teams of contestants compete in tug of war. The losing team falls to their death.',
    eliminationCount: 3,
    primaryStats: ['strength', 'charisma'],
    secondaryStats: ['intelligence'],
    allowsAlliances: true,
    requiresTeamwork: true,
    hasRandomElement: false
  },
  {
    type: 'Marbles',
    name: 'Marbles',
    description: 'Contestants pair up and play marble games. The loser of each pair is eliminated.',
    eliminationCount: 2,
    primaryStats: ['intelligence', 'deception'],
    secondaryStats: ['luck', 'charisma'],
    allowsAlliances: true,
    requiresTeamwork: false,
    hasRandomElement: true
  },
  {
    type: 'Glass Bridge',
    name: 'Glass Bridge',
    description: 'Players must cross a bridge made of glass panels. Some panels are tempered glass, others will shatter.',
    eliminationCount: 1,
    primaryStats: ['luck', 'intelligence'],
    secondaryStats: ['agility'],
    allowsAlliances: false,
    requiresTeamwork: false,
    hasRandomElement: true
  },
  {
    type: 'Final Squid Game',
    name: 'Squid Game',
    description: 'The final two contestants face off in the traditional Korean game of Squid Game.',
    eliminationCount: 1,
    primaryStats: ['strength', 'agility', 'intelligence'],
    secondaryStats: ['deception', 'luck'],
    allowsAlliances: false,
    requiresTeamwork: false,
    hasRandomElement: false
  }
];

// Helper function to get round by type
export function getRoundByType(type: GameRound['type']): GameRound | undefined {
  return GAME_ROUNDS.find(round => round.type === type);
}

// Helper function to get elimination count for remaining contestants
export function getEliminationCount(roundType: GameRound['type'], remainingContestants: number): number {
  const round = getRoundByType(roundType);
  if (!round) return 1;
  
  // Adjust elimination count based on remaining contestants
  if (remainingContestants <= 2) {
    return 1; // Final round always eliminates 1
  }
  
  // Don't eliminate more than we have
  return Math.min(round.eliminationCount, remainingContestants - 1);
}

// Get the next round based on current round number
export function getNextRound(currentRoundIndex: number): GameRound | null {
  if (currentRoundIndex >= GAME_ROUNDS.length) {
    return null;
  }
  return GAME_ROUNDS[currentRoundIndex];
}

// Check if game is complete
export function isGameComplete(currentRoundIndex: number): boolean {
  return currentRoundIndex >= GAME_ROUNDS.length;
}

import type { Bet, BettingState, Contestant } from '../types/index';

// Initialize betting state
export function initializeBettingState(): BettingState {
  return {
    userBalance: 1000, // Starting balance
    activeBets: [],
    bettingHistory: [],
    totalWinnings: 0,
    totalLosses: 0
  };
}

// Place a bet on a contestant
export function placeBet(
  bettingState: BettingState,
  contestantId: string,
  amount: number,
  odds: number
): { success: boolean; message: string; newState?: BettingState } {
  
  // Validation checks
  if (amount <= 0) {
    return { success: false, message: 'Bet amount must be positive' };
  }
  
  if (amount > bettingState.userBalance) {
    return { success: false, message: 'Insufficient balance' };
  }
  
  if (odds <= 1) {
    return { success: false, message: 'Invalid odds' };
  }
  
  // Check if user already has a bet on this contestant
  const existingBet = bettingState.activeBets.find(bet => bet.contestantId === contestantId);
  if (existingBet) {
    return { success: false, message: 'You already have a bet on this contestant' };
  }
  
  // Create new bet
  const newBet: Bet = {
    id: generateBetId(),
    contestantId,
    amount,
    odds,
    potentialPayout: amount * odds,
    timestamp: new Date(),
    status: 'active'
  };
  
  // Update betting state
  const newState: BettingState = {
    ...bettingState,
    userBalance: bettingState.userBalance - amount,
    activeBets: [...bettingState.activeBets, newBet],
    bettingHistory: [...bettingState.bettingHistory, newBet]
  };
  
  return {
    success: true,
    message: `Bet placed successfully! Potential payout: $${newBet.potentialPayout.toFixed(2)}`,
    newState
  };
}

// Cancel an active bet (before game starts)
export function cancelBet(
  bettingState: BettingState,
  betId: string
): { success: boolean; message: string; newState?: BettingState } {
  
  const betIndex = bettingState.activeBets.findIndex(bet => bet.id === betId);
  if (betIndex === -1) {
    return { success: false, message: 'Bet not found' };
  }
  
  const bet = bettingState.activeBets[betIndex];
  
  // Remove bet and refund amount
  const newActiveBets = [...bettingState.activeBets];
  newActiveBets.splice(betIndex, 1);
  
  const newState: BettingState = {
    ...bettingState,
    userBalance: bettingState.userBalance + bet.amount,
    activeBets: newActiveBets
  };
  
  return {
    success: true,
    message: `Bet cancelled. $${bet.amount} refunded.`,
    newState
  };
}

// Resolve bets after game completion with multiple survivors
export function resolveBetsWithSurvivors(
  bettingState: BettingState,
  survivors: Contestant[]
): BettingState {

  let totalWinnings = 0;
  let totalLosses = 0;
  const survivorIds = survivors.map(s => s.id);

  const resolvedBets = bettingState.activeBets.map(bet => {
    if (survivorIds.includes(bet.contestantId)) {
      // Winning bet - split the payout among all survivors
      const splitPayout = bet.potentialPayout / survivors.length;
      totalWinnings += splitPayout;
      return {
        ...bet,
        status: 'won' as const,
        actualPayout: splitPayout,
        splitReason: survivors.length > 1 ? `Split among ${survivors.length} survivors` : undefined
      };
    } else {
      // Losing bet
      totalLosses += bet.amount;
      return { ...bet, status: 'lost' as const };
    }
  });


  // Update betting history
  const updatedHistory = bettingState.bettingHistory.map(historyBet => {
    const resolvedBet = resolvedBets.find(rb => rb.id === historyBet.id);
    return resolvedBet || historyBet;
  });

  return {
    ...bettingState,
    userBalance: bettingState.userBalance + totalWinnings,
    activeBets: [], // Clear active bets
    bettingHistory: updatedHistory,
    totalWinnings: bettingState.totalWinnings + totalWinnings,
    totalLosses: bettingState.totalLosses + totalLosses
  };
}

// Legacy function for single winner (backwards compatibility)
export function resolveBets(
  bettingState: BettingState,
  winner: Contestant
): BettingState {
  return resolveBetsWithSurvivors(bettingState, [winner]);
}

// Calculate dynamic odds based on current game state
export function calculateDynamicOdds(
  contestants: Contestant[],
  roundNumber: number,
  totalRounds: number
): Contestant[] {
  
  const aliveContestants = contestants.filter(c => c.status === 'alive');
  const totalAlive = aliveContestants.length;
  
  return contestants.map(contestant => {
    if (contestant.status !== 'alive') {
      return { ...contestant, currentOdds: 0 };
    }
    
    // Base calculation from stats
    const statTotal = Object.values(contestant.stats).reduce((sum, stat) => sum + stat, 0);
    const avgStat = statTotal / 6;
    
    // Survival bonus (fewer contestants = better odds for survivors)
    const survivalBonus = (10 - totalAlive) * 0.5;
    
    // Round progression bonus (later rounds = more valuable)
    const progressionBonus = (roundNumber / totalRounds) * 2;
    
    // Personality modifiers for late game
    let lateGameModifier = 0;
    if (roundNumber > totalRounds / 2) {
      switch (contestant.personality) {
        case 'Calculating':
        case 'Ambitious':
          lateGameModifier = -1; // Better odds
          break;
        case 'Empathetic':
        case 'Loyal':
          lateGameModifier = 1; // Worse odds
          break;
      }
    }
    
    // Calculate final odds
    const baseOdds = 12 - avgStat - survivalBonus - progressionBonus + lateGameModifier;
    const finalOdds = Math.max(1.1, Math.min(50, baseOdds));
    
    return {
      ...contestant,
      currentOdds: Math.round(finalOdds * 10) / 10
    };
  });
}

// Get betting statistics
export function getBettingStats(bettingState: BettingState): {
  totalBetsPlaced: number;
  totalAmountBet: number;
  winRate: number;
  netProfit: number;
  averageBetSize: number;
} {
  
  const completedBets = bettingState.bettingHistory.filter(bet => bet.status !== 'active');
  const wonBets = completedBets.filter(bet => bet.status === 'won');
  
  const totalAmountBet = bettingState.bettingHistory.reduce((sum, bet) => sum + bet.amount, 0);
  const averageBetSize = totalAmountBet / Math.max(1, bettingState.bettingHistory.length);
  const winRate = wonBets.length / Math.max(1, completedBets.length);
  const netProfit = bettingState.totalWinnings - bettingState.totalLosses;
  
  return {
    totalBetsPlaced: bettingState.bettingHistory.length,
    totalAmountBet,
    winRate,
    netProfit,
    averageBetSize
  };
}

// Calculate potential payout for a bet amount and odds
export function calculatePayout(amount: number, odds: number): number {
  return amount * odds;
}

// Get recommended bet amount based on balance and odds
export function getRecommendedBetAmount(balance: number, odds: number): number {
  // Kelly Criterion simplified: bet a percentage based on odds and balance
  const maxBetPercentage = 0.1; // Never bet more than 10% of balance
  const oddsAdjustedPercentage = Math.min(maxBetPercentage, (odds - 1) / (odds * 10));
  
  return Math.floor(balance * oddsAdjustedPercentage);
}

// Validate bet parameters
export function validateBet(amount: number, balance: number, odds: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (amount <= 0) {
    errors.push('Bet amount must be positive');
  }
  
  if (amount > balance) {
    errors.push('Insufficient balance');
  }
  
  if (odds <= 1) {
    errors.push('Odds must be greater than 1');
  }
  
  if (amount < 1) {
    errors.push('Minimum bet is $1');
  }
  
  if (amount > balance * 0.5) {
    errors.push('Cannot bet more than 50% of balance in one bet');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate unique bet ID
function generateBetId(): string {
  return `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Format odds for display
export function formatOdds(odds: number): string {
  return `${odds.toFixed(1)}:1`;
}

// Calculate implied probability from odds
export function getImpliedProbability(odds: number): number {
  return (1 / odds) * 100;
}

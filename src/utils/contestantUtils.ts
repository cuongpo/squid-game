import type { Contestant, GameRound, PersonalityType, TraitType } from '../types/index';

// Calculate a contestant's effectiveness for a specific round
export function calculateRoundEffectiveness(contestant: Contestant, round: GameRound): number {
  let effectiveness = 0;
  
  // Primary stats have more weight
  for (const stat of round.primaryStats) {
    effectiveness += contestant.stats[stat] * 2;
  }
  
  // Secondary stats have less weight
  for (const stat of round.secondaryStats) {
    effectiveness += contestant.stats[stat] * 1;
  }
  
  // Personality modifiers
  effectiveness += getPersonalityModifier(contestant.personality, round);
  
  // Trait modifiers
  effectiveness += getTraitModifier(contestant.trait, round);
  
  return Math.max(0, effectiveness);
}

// Get personality-based modifiers for specific rounds
function getPersonalityModifier(personality: PersonalityType, round: GameRound): number {
  const modifiers: Record<PersonalityType, Record<string, number>> = {
    'Cautious': {
      'Red Light Green Light': 3,
      'Tug of War': 1,
      'Marbles': 2,
      'Glass Bridge': 2,
      'Final Squid Game': 1
    },
    'Ambitious': {
      'Red Light Green Light': 1,
      'Tug of War': 2,
      'Marbles': 3,
      'Glass Bridge': 1,
      'Final Squid Game': 3
    },
    'Loyal': {
      'Red Light Green Light': 1,
      'Tug of War': 4,
      'Marbles': -1,
      'Glass Bridge': 1,
      'Final Squid Game': 2
    },
    'Calculating': {
      'Red Light Green Light': 2,
      'Tug of War': 3,
      'Marbles': 4,
      'Glass Bridge': 3,
      'Final Squid Game': 3
    },
    'Reckless': {
      'Red Light Green Light': -2,
      'Tug of War': 2,
      'Marbles': 1,
      'Glass Bridge': -3,
      'Final Squid Game': 2
    },
    'Empathetic': {
      'Red Light Green Light': 1,
      'Tug of War': 2,
      'Marbles': -2,
      'Glass Bridge': 1,
      'Final Squid Game': -2
    },
    'Aggressive': {
      'Red Light Green Light': 0,
      'Tug of War': 3,
      'Marbles': 1,
      'Glass Bridge': 1,
      'Final Squid Game': 4
    },
    'Lucky': {
      'Red Light Green Light': 2,
      'Tug of War': 1,
      'Marbles': 3,
      'Glass Bridge': 4,
      'Final Squid Game': 2
    },
    'Deceptive': {
      'Red Light Green Light': 1,
      'Tug of War': 1,
      'Marbles': 4,
      'Glass Bridge': 2,
      'Final Squid Game': 3
    },
    'Resourceful': {
      'Red Light Green Light': 2,
      'Tug of War': 2,
      'Marbles': 2,
      'Glass Bridge': 3,
      'Final Squid Game': 2
    }
  };
  
  return modifiers[personality][round.name] || 0;
}

// Get trait-based modifiers for specific rounds
function getTraitModifier(trait: TraitType, round: GameRound): number {
  const modifiers: Record<TraitType, Record<string, number>> = {
    'Survivor': {
      'Red Light Green Light': 3,
      'Tug of War': 1,
      'Marbles': 2,
      'Glass Bridge': 2,
      'Final Squid Game': 1
    },
    'Opportunist': {
      'Red Light Green Light': 1,
      'Tug of War': 2,
      'Marbles': 3,
      'Glass Bridge': 2,
      'Final Squid Game': 3
    },
    'Protector': {
      'Red Light Green Light': 0,
      'Tug of War': 4,
      'Marbles': -1,
      'Glass Bridge': 1,
      'Final Squid Game': 2
    },
    'Strategist': {
      'Red Light Green Light': 2,
      'Tug of War': 3,
      'Marbles': 4,
      'Glass Bridge': 3,
      'Final Squid Game': 3
    },
    'Daredevil': {
      'Red Light Green Light': -1,
      'Tug of War': 2,
      'Marbles': 1,
      'Glass Bridge': -2,
      'Final Squid Game': 2
    },
    'Peacemaker': {
      'Red Light Green Light': 1,
      'Tug of War': 1,
      'Marbles': -2,
      'Glass Bridge': 1,
      'Final Squid Game': -2
    },
    'Challenger': {
      'Red Light Green Light': 0,
      'Tug of War': 3,
      'Marbles': 1,
      'Glass Bridge': 1,
      'Final Squid Game': 4
    },
    'Fortunate': {
      'Red Light Green Light': 2,
      'Tug of War': 1,
      'Marbles': 3,
      'Glass Bridge': 4,
      'Final Squid Game': 2
    },
    'Liar': {
      'Red Light Green Light': 1,
      'Tug of War': 1,
      'Marbles': 4,
      'Glass Bridge': 2,
      'Final Squid Game': 3
    },
    'Improviser': {
      'Red Light Green Light': 2,
      'Tug of War': 2,
      'Marbles': 2,
      'Glass Bridge': 3,
      'Final Squid Game': 2
    }
  };
  
  return modifiers[trait][round.name] || 0;
}

// Update contestant odds based on performance and remaining contestants
export function updateContestantOdds(contestants: Contestant[]): Contestant[] {
  const aliveContestants = contestants.filter(c => c.status === 'alive');
  const totalContestants = aliveContestants.length;
  
  return contestants.map(contestant => {
    if (contestant.status !== 'alive') {
      return { ...contestant, currentOdds: 0 };
    }
    
    // Calculate base odds from stats
    const statTotal = Object.values(contestant.stats).reduce((sum, stat) => sum + stat, 0);
    const avgStat = statTotal / 6;
    
    // Factor in number of remaining contestants
    const scarcityMultiplier = totalContestants / 10;
    
    // Calculate new odds (lower is better for the contestant)
    const newOdds = Math.max(1.1, (11 - avgStat) * scarcityMultiplier);
    
    return {
      ...contestant,
      currentOdds: Math.round(newOdds * 10) / 10
    };
  });
}

// Get contestants sorted by survival probability
export function getContestantsByProbability(contestants: Contestant[]): Contestant[] {
  return contestants
    .filter(c => c.status === 'alive')
    .sort((a, b) => a.currentOdds - b.currentOdds); // Lower odds = higher probability
}

// Calculate total stat power for a contestant
export function getTotalStatPower(contestant: Contestant): number {
  return Object.values(contestant.stats).reduce((sum, stat) => sum + stat, 0);
}

// Get a contestant's strongest stats
export function getStrongestStats(contestant: Contestant, count: number = 3): Array<{stat: keyof Contestant['stats'], value: number}> {
  return Object.entries(contestant.stats)
    .map(([stat, value]) => ({ stat: stat as keyof Contestant['stats'], value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

// Get a contestant's weakest stats
export function getWeakestStats(contestant: Contestant, count: number = 2): Array<{stat: keyof Contestant['stats'], value: number}> {
  return Object.entries(contestant.stats)
    .map(([stat, value]) => ({ stat: stat as keyof Contestant['stats'], value }))
    .sort((a, b) => a.value - b.value)
    .slice(0, count);
}

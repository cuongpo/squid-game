import type { Contestant } from '../types/index';

export const INITIAL_CONTESTANTS: Omit<Contestant, 'status' | 'relationships' | 'roundsParticipated' | 'currentOdds' | 'totalBetsPlaced'>[] = [
  {
    id: 'jihoon',
    name: 'Jihoon',
    personality: 'Cautious',
    trait: 'Survivor',
    description: 'Avoids risks, prefers alliances. A former office worker who thinks three steps ahead.',
    stats: {
      strength: 5,
      intelligence: 8,
      luck: 6,
      charisma: 7,
      agility: 4,
      deception: 3
    }
  },
  {
    id: 'minseo',
    name: 'Minseo',
    personality: 'Ambitious',
    trait: 'Opportunist',
    description: 'Seizes chances, may betray others. A business executive who sees every situation as a deal.',
    stats: {
      strength: 6,
      intelligence: 9,
      luck: 5,
      charisma: 8,
      agility: 6,
      deception: 8
    }
  },
  {
    id: 'daejung',
    name: 'Daejung',
    personality: 'Loyal',
    trait: 'Protector',
    description: 'Shields allies, risks self for others. A former soldier with an unbreakable moral code.',
    stats: {
      strength: 9,
      intelligence: 6,
      luck: 4,
      charisma: 7,
      agility: 7,
      deception: 2
    }
  },
  {
    id: 'hana',
    name: 'Hana',
    personality: 'Calculating',
    trait: 'Strategist',
    description: 'Plans ahead, manipulates situations. A chess master who treats life like a game.',
    stats: {
      strength: 4,
      intelligence: 10,
      luck: 6,
      charisma: 6,
      agility: 5,
      deception: 7
    }
  },
  {
    id: 'sunwoo',
    name: 'Sunwoo',
    personality: 'Reckless',
    trait: 'Daredevil',
    description: 'Takes big risks, high reward or failure. A former stunt performer who lives for adrenaline.',
    stats: {
      strength: 7,
      intelligence: 4,
      luck: 8,
      charisma: 6,
      agility: 9,
      deception: 5
    }
  },
  {
    id: 'sora',
    name: 'Sora',
    personality: 'Empathetic',
    trait: 'Peacemaker',
    description: 'Tries to resolve conflicts, avoids violence. A social worker who believes in human goodness.',
    stats: {
      strength: 3,
      intelligence: 7,
      luck: 7,
      charisma: 9,
      agility: 5,
      deception: 2
    }
  },
  {
    id: 'kyung',
    name: 'Kyung',
    personality: 'Aggressive',
    trait: 'Challenger',
    description: 'Instigates duels, confronts threats. A former gang member who solves problems with force.',
    stats: {
      strength: 10,
      intelligence: 5,
      luck: 5,
      charisma: 4,
      agility: 8,
      deception: 6
    }
  },
  {
    id: 'yuna',
    name: 'Yuna',
    personality: 'Lucky',
    trait: 'Fortunate',
    description: 'Random events often favor her. A lottery winner who seems to have fate on her side.',
    stats: {
      strength: 5,
      intelligence: 6,
      luck: 10,
      charisma: 7,
      agility: 6,
      deception: 4
    }
  },
  {
    id: 'taemin',
    name: 'Taemin',
    personality: 'Deceptive',
    trait: 'Liar',
    description: 'Bluffs, deceives, and manipulates others. A con artist who can make anyone believe anything.',
    stats: {
      strength: 4,
      intelligence: 8,
      luck: 6,
      charisma: 8,
      agility: 6,
      deception: 10
    }
  },
  {
    id: 'mira',
    name: 'Mira',
    personality: 'Resourceful',
    trait: 'Improviser',
    description: 'Adapts quickly, uses environment well. A street-smart survivor who makes the most of any situation.',
    stats: {
      strength: 6,
      intelligence: 7,
      luck: 7,
      charisma: 6,
      agility: 8,
      deception: 6
    }
  }
];

// Function to initialize contestants with default values
export function initializeContestants(): Contestant[] {
  return INITIAL_CONTESTANTS.map(contestant => ({
    ...contestant,
    status: 'alive' as const,
    relationships: {
      allies: [],
      enemies: [],
      neutral: INITIAL_CONTESTANTS.filter(c => c.id !== contestant.id).map(c => c.id)
    },
    roundsParticipated: [],
    currentOdds: calculateInitialOdds(contestant),
    totalBetsPlaced: 0
  }));
}

// Calculate initial betting odds based on contestant stats
function calculateInitialOdds(contestant: Omit<Contestant, 'status' | 'relationships' | 'roundsParticipated' | 'currentOdds' | 'totalBetsPlaced'>): number {
  const { stats } = contestant;
  
  // Calculate overall power score (higher is better)
  const powerScore = (
    stats.strength * 1.2 +
    stats.intelligence * 1.3 +
    stats.luck * 1.1 +
    stats.charisma * 1.0 +
    stats.agility * 1.2 +
    stats.deception * 0.8
  ) / 6;
  
  // Convert to odds (lower power score = higher odds)
  // Range from about 2.0 to 15.0
  const baseOdds = 17 - powerScore;
  
  // Add some personality-based modifiers
  let modifier = 1.0;
  switch (contestant.personality) {
    case 'Lucky':
      modifier = 0.8; // Better odds for lucky characters
      break;
    case 'Reckless':
      modifier = 1.3; // Worse odds for reckless characters
      break;
    case 'Calculating':
      modifier = 0.9; // Slightly better odds for strategic characters
      break;
    case 'Empathetic':
      modifier = 1.2; // Worse odds in a deadly game
      break;
  }
  
  return Math.round((baseOdds * modifier) * 10) / 10;
}

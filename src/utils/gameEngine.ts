import type { Contestant, GameRound, GameEvent, GameState } from '../types/index';
import { calculateRoundEffectiveness, updateContestantOdds } from './contestantUtils';
import { generateRoundNarrative, type NarrativeContext } from '../services/openaiNarrative';
import { getEliminationCount } from '../data/gameRounds';

// Synchronous version for tests and immediate results
export function simulateRoundSync(
  contestants: Contestant[],
  round: GameRound,
  roundNumber: number
): {
  survivors: Contestant[];
  eliminated: Contestant[];
  events: GameEvent[];
  narrative: string[];
} {
  const aliveContestants = contestants.filter(c => c.status === 'alive');
  const events: GameEvent[] = [];

  if (aliveContestants.length === 0) {
    return {
      survivors: [],
      eliminated: [],
      events: [],
      narrative: [`Round ${roundNumber}: ${round.name}`, 'No contestants remaining.']
    };
  }

  // Calculate effectiveness for each contestant
  const contestantEffectiveness = aliveContestants.map(contestant => ({
    contestant,
    effectiveness: calculateRoundEffectiveness(contestant, round),
    randomFactor: round.hasRandomElement ? Math.random() * 10 : 0
  }));

  // Use synchronous simulation
  const roundResults = simulateGenericRoundSync(contestantEffectiveness, round, roundNumber);
  return roundResults;
}

// Main function to simulate a game round (async for AI narratives)
export async function simulateRound(
  contestants: Contestant[],
  round: GameRound,
  roundNumber: number
): Promise<{
  survivors: Contestant[];
  eliminated: Contestant[];
  events: GameEvent[];
  narrative: string[];
}> {
  const aliveContestants = contestants.filter(c => c.status === 'alive');
  const events: GameEvent[] = [];

  // Calculate effectiveness for each contestant
  const contestantEffectiveness = aliveContestants.map(contestant => ({
    contestant,
    effectiveness: calculateRoundEffectiveness(contestant, round),
    randomFactor: round.hasRandomElement ? Math.random() * 10 : 0
  }));

  // Add round-specific logic to determine survivors and eliminated
  let roundResults;
  switch (round.type) {
    case 'Red Light Green Light':
      roundResults = await simulateRedLightGreenLight(contestantEffectiveness, round, roundNumber);
      break;
    case 'Tug of War':
      roundResults = await simulateTugOfWar(contestantEffectiveness, round, roundNumber);
      break;
    case 'Marbles':
      roundResults = await simulateMarbles(contestantEffectiveness, round, roundNumber);
      break;
    case 'Glass Bridge':
      roundResults = await simulateGlassBridge(contestantEffectiveness, round, roundNumber);
      break;
    case 'Final Squid Game':
      roundResults = await simulateFinalSquidGame(contestantEffectiveness, round, roundNumber);
      break;
    default:
      roundResults = await simulateGenericRound(contestantEffectiveness, round, roundNumber);
  }

  return roundResults;
}

// Red Light, Green Light simulation
async function simulateRedLightGreenLight(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];

  // Sort by effectiveness + random factor (higher is better)
  const sorted = contestantData.sort((a, b) =>
    (b.effectiveness + b.randomFactor) - (a.effectiveness + a.randomFactor)
  );

  const eliminationCount = getEliminationCount(round.type, sorted.length);
  console.log(`Round ${roundNumber} (${round.name}): ${sorted.length} contestants, eliminating ${eliminationCount}`);
  const survivors = sorted.slice(0, sorted.length - eliminationCount);
  const eliminated = sorted.slice(-eliminationCount);

  // Create events for eliminations
  eliminated.forEach(({contestant}) => {
    events.push({
      id: `elimination-${contestant.id}-${roundNumber}`,
      round: roundNumber,
      type: 'elimination',
      description: `${contestant.name} was eliminated in ${round.name}`,
      involvedContestants: [contestant.id],
      timestamp: new Date()
    });
  });

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: survivors.map(s => s.contestant),
    eliminated: eliminated.map(e => e.contestant)
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      "The giant doll begins to turn around. Players must freeze completely when it looks...",
      ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
      `${survivors.length} contestants survive to the next round.`
    ];
  }
  
  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Tug of War simulation
async function simulateTugOfWar(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];
  
  // Form teams based on charisma and alliances
  const teams = formTeams(contestantData);
  
  // Calculate team strength
  const teamStrengths = teams.map(team => ({
    team,
    totalStrength: team.reduce((sum, member) => sum + member.effectiveness, 0)
  }));
  
  // Determine losing teams
  teamStrengths.sort((a, b) => b.totalStrength - a.totalStrength);
  const eliminationCount = getEliminationCount(round.type, contestantData.length);
  console.log(`Round ${roundNumber} (${round.name}): ${contestantData.length} contestants, eliminating ${eliminationCount}`);
  
  let eliminated: typeof contestantData = [];
  let survivors: typeof contestantData = [];
  
  // Eliminate from weakest teams first
  for (let i = teamStrengths.length - 1; i >= 0 && eliminated.length < eliminationCount; i--) {
    const team = teamStrengths[i].team;
    const needed = eliminationCount - eliminated.length;

    if (needed >= team.length) {
      eliminated.push(...team);
    } else {
      // Eliminate weakest members of the team
      team.sort((a, b) => a.effectiveness - b.effectiveness);
      eliminated.push(...team.slice(0, needed));
      survivors.push(...team.slice(needed));
    }
  }

  // Add remaining teams to survivors
  for (let i = 0; i < teamStrengths.length - 1; i++) {
    if (!eliminated.some(e => teamStrengths[i].team.includes(e))) {
      survivors.push(...teamStrengths[i].team);
    }
  }

  // Create events for eliminations
  eliminated.forEach(({contestant}) => {
    events.push({
      id: `elimination-${contestant.id}-${roundNumber}`,
      round: roundNumber,
      type: 'elimination',
      description: `${contestant.name} was eliminated in ${round.name}`,
      involvedContestants: [contestant.id],
      timestamp: new Date()
    });
  });

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: survivors.map(s => s.contestant),
    eliminated: eliminated.map(e => e.contestant)
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      "Contestants must form teams for the ultimate test of strength and strategy...",
      ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
      `${survivors.length} contestants survive to the next round.`
    ];
  }

  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Helper function to form teams for Tug of War
function formTeams(contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>) {
  const teams: typeof contestantData[] = [];
  const remaining = [...contestantData];
  
  while (remaining.length > 0) {
    const teamSize = Math.min(3, remaining.length);
    const team = remaining.splice(0, teamSize);
    teams.push(team);
  }
  
  return teams;
}

// Synchronous generic round simulation
function simulateGenericRoundSync(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];

  // Sort by effectiveness + random factor
  const sorted = contestantData.sort((a, b) =>
    (b.effectiveness + b.randomFactor) - (a.effectiveness + a.randomFactor)
  );

  const eliminationCount = Math.min(round.eliminationCount, sorted.length);
  console.log(`Round ${roundNumber} (${round.name}): ${sorted.length} contestants, eliminating ${eliminationCount}`);

  const survivors = sorted.slice(0, sorted.length - eliminationCount);
  const eliminated = sorted.slice(-eliminationCount);

  // Create events for eliminations
  eliminated.forEach(({contestant}) => {
    events.push({
      id: `elimination-${contestant.id}-${roundNumber}`,
      round: roundNumber,
      type: 'elimination',
      description: `${contestant.name} was eliminated in ${round.name}`,
      involvedContestants: [contestant.id],
      timestamp: new Date()
    });
  });

  // Simple fallback narrative
  const narrative = [
    `Round ${roundNumber}: ${round.name}`,
    `The contestants face the challenge of ${round.name}.`,
    ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
    `${survivors.length} contestants survive to the next round.`
  ];

  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Generic round simulation for other game types (async for AI narratives)
async function simulateGenericRound(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];

  // Sort by effectiveness + random factor
  const sorted = contestantData.sort((a, b) =>
    (b.effectiveness + b.randomFactor) - (a.effectiveness + a.randomFactor)
  );

  const eliminationCount = getEliminationCount(round.type, sorted.length);
  console.log(`Round ${roundNumber} (${round.name}): ${sorted.length} contestants, eliminating ${eliminationCount}`);
  console.log('Sorted contestants:', sorted.map(c => c.contestant.name));

  const survivors = sorted.slice(0, sorted.length - eliminationCount);
  const eliminated = sorted.slice(-eliminationCount);

  console.log('Survivors:', survivors.map(c => c.contestant.name));
  console.log('Eliminated:', eliminated.map(c => c.contestant.name));

  eliminated.forEach(({contestant}) => {
    events.push({
      id: `elimination-${contestant.id}-${roundNumber}`,
      round: roundNumber,
      type: 'elimination',
      description: `${contestant.name} was eliminated in ${round.name}`,
      involvedContestants: [contestant.id],
      timestamp: new Date()
    });
  });

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: survivors.map(s => s.contestant),
    eliminated: eliminated.map(e => e.contestant)
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      `The contestants face the challenge of ${round.name}.`,
      ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
      `${survivors.length} contestants survive to the next round.`
    ];
  }
  
  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Marbles simulation
async function simulateMarbles(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];
  console.log(`Round ${roundNumber} (${round.name}): ${contestantData.length} contestants, pairing for marbles`);

  // Pair contestants
  const shuffled = [...contestantData].sort(() => Math.random() - 0.5);
  const pairs: Array<[typeof contestantData[0], typeof contestantData[0]]> = [];

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }

  const survivors: typeof contestantData = [];
  const eliminated: typeof contestantData = [];

  // Handle odd number of contestants
  if (shuffled.length % 2 === 1) {
    const lastContestant = shuffled[shuffled.length - 1];
    survivors.push(lastContestant);
  }

  // Simulate each pair
  pairs.forEach(([contestant1, contestant2], index) => {
    const score1 = contestant1.effectiveness + contestant1.randomFactor;
    const score2 = contestant2.effectiveness + contestant2.randomFactor;

    const winner = score1 > score2 ? contestant1 : contestant2;
    const loser = score1 > score2 ? contestant2 : contestant1;

    survivors.push(winner);
    eliminated.push(loser);

    events.push({
      id: `elimination-${loser.contestant.id}-${roundNumber}`,
      round: roundNumber,
      type: 'elimination',
      description: `${loser.contestant.name} lost at marbles to ${winner.contestant.name}`,
      involvedContestants: [winner.contestant.id, loser.contestant.id],
      timestamp: new Date()
    });
  });

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: survivors.map(s => s.contestant),
    eliminated: eliminated.map(e => e.contestant)
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      "Contestants pair up for a deadly game of marbles. Only one from each pair survives...",
      ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
      `${survivors.length} contestants survive to the next round.`
    ];
  }

  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Glass Bridge simulation
async function simulateGlassBridge(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];

  // Sort by effectiveness (smarter contestants go later to observe)
  const sorted = contestantData.sort((a, b) => a.effectiveness - b.effectiveness);

  const survivors: typeof contestantData = [];
  const eliminated: typeof contestantData = [];

  const eliminationCount = getEliminationCount(round.type, sorted.length);
  console.log(`Round ${roundNumber} (${round.name}): ${sorted.length} contestants, eliminating ${eliminationCount}`);
  console.log('Glass Bridge contestants:', sorted.map(c => c.contestant.name));

  // Simulate crossing order
  for (let index = 0; index < sorted.length; index++) {
    const contestant = sorted[index];
    const survivalChance = 0.3 + (contestant.effectiveness / 100) + (index * 0.1); // Later = better chance
    const randomRoll = Math.random();

    if (randomRoll < survivalChance) {
      survivors.push(contestant);
    } else {
      eliminated.push(contestant);

      events.push({
        id: `elimination-${contestant.contestant.id}-${roundNumber}`,
        round: roundNumber,
        type: 'elimination',
        description: `${contestant.contestant.name} fell through the glass bridge`,
        involvedContestants: [contestant.contestant.id],
        timestamp: new Date()
      });
    }

    // Stop if we've eliminated enough
    if (eliminated.length >= eliminationCount) {
      // Add remaining contestants as survivors
      survivors.push(...sorted.slice(index + 1));
      break;
    }
  }

  console.log('Glass Bridge results:');
  console.log('Survivors:', survivors.map(c => c.contestant.name));
  console.log('Eliminated:', eliminated.map(c => c.contestant.name));

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: survivors.map(s => s.contestant),
    eliminated: eliminated.map(e => e.contestant)
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      "Contestants must cross a bridge of glass panels. Some are tempered, others will shatter...",
      ...eliminated.map(({contestant}) => `${contestant.name} was eliminated.`),
      `${survivors.length} contestants survive to the next round.`
    ];
  }

  return {
    survivors: survivors.map(s => ({
      ...s.contestant,
      roundsParticipated: [...s.contestant.roundsParticipated, round.type]
    })),
    eliminated: eliminated.map(e => ({
      ...e.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...e.contestant.roundsParticipated, round.type]
    })),
    events,
    narrative
  };
}

// Final Squid Game simulation
async function simulateFinalSquidGame(
  contestantData: Array<{contestant: Contestant; effectiveness: number; randomFactor: number}>,
  round: GameRound,
  roundNumber: number
) {
  const events: GameEvent[] = [];

  const eliminationCount = getEliminationCount(round.type, contestantData.length);
  console.log(`Round ${roundNumber} (${round.name}): ${contestantData.length} contestants, eliminating ${eliminationCount}`);

  if (contestantData.length !== 2) {
    // If not exactly 2 contestants, use generic elimination logic
    return simulateGenericRound(contestantData, round, roundNumber);
  }

  const [contestant1, contestant2] = contestantData;

  // Calculate final scores based on multiple factors
  const score1 = (
    contestant1.contestant.stats.strength * 0.3 +
    contestant1.contestant.stats.agility * 0.3 +
    contestant1.contestant.stats.intelligence * 0.2 +
    contestant1.contestant.stats.deception * 0.1 +
    contestant1.contestant.stats.luck * 0.1
  ) + contestant1.randomFactor;

  const score2 = (
    contestant2.contestant.stats.strength * 0.3 +
    contestant2.contestant.stats.agility * 0.3 +
    contestant2.contestant.stats.intelligence * 0.2 +
    contestant2.contestant.stats.deception * 0.1 +
    contestant2.contestant.stats.luck * 0.1
  ) + contestant2.randomFactor;

  const winner = score1 > score2 ? contestant1 : contestant2;
  const loser = score1 > score2 ? contestant2 : contestant1;

  events.push({
    id: `elimination-${loser.contestant.id}-${roundNumber}`,
    round: roundNumber,
    type: 'elimination',
    description: `${loser.contestant.name} was defeated in the final Squid Game`,
    involvedContestants: [winner.contestant.id, loser.contestant.id],
    timestamp: new Date()
  });

  // Generate AI narrative
  const narrativeContext: NarrativeContext = {
    round,
    roundNumber,
    contestants: contestantData.map(c => c.contestant),
    survivors: [winner.contestant],
    eliminated: [loser.contestant]
  };

  let narrative: string[] = [];
  try {
    const aiNarrative = await generateRoundNarrative(narrativeContext);
    narrative = [
      ...aiNarrative.setupNarrative,
      ...aiNarrative.actionNarrative,
      ...aiNarrative.eliminationNarrative,
      ...aiNarrative.dramaticMoments
    ];
  } catch (error) {
    console.error('Failed to generate AI narrative, using fallback:', error);
    // Fallback to simple narrative
    narrative = [
      `Round ${roundNumber}: ${round.name}`,
      "The final two contestants face off in the traditional Korean game of Squid Game...",
      `${winner.contestant.name} and ${loser.contestant.name} engage in fierce combat.`,
      `After an intense battle, ${winner.contestant.name} emerges victorious!`,
      `${loser.contestant.name} falls, leaving ${winner.contestant.name} as the sole survivor.`
    ];
  }

  return {
    survivors: [{
      ...winner.contestant,
      status: 'winner' as const,
      roundsParticipated: [...winner.contestant.roundsParticipated, round.type]
    }],
    eliminated: [{
      ...loser.contestant,
      status: 'eliminated' as const,
      eliminationRound: round.type,
      roundsParticipated: [...loser.contestant.roundsParticipated, round.type]
    }],
    events,
    narrative
  };
}

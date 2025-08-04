import OpenAI from 'openai';
import type { Contestant, GameRound } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
});

// Check if API key is configured
const isOpenAIConfigured = !!import.meta.env.VITE_OPENAI_API_KEY;

export interface NarrativeContext {
  round: GameRound;
  roundNumber: number;
  contestants: Contestant[];
  survivors: Contestant[];
  eliminated: Contestant[];
  gameEvents?: any[];
}

export interface GeneratedNarrative {
  setupNarrative: string[];
  actionNarrative: string[];
  eliminationNarrative: string[];
  dramaticMoments: string[];
}

/**
 * Generate dynamic narrative using OpenAI for a game round
 */
export async function generateRoundNarrative(context: NarrativeContext): Promise<GeneratedNarrative> {
  const { round, roundNumber, contestants, survivors, eliminated } = context;

  // Check if OpenAI is configured
  if (!isOpenAIConfigured) {
    console.log('OpenAI not configured, using enhanced fallback narrative');
    return generateEnhancedFallbackNarrative(context);
  }

  try {
    const prompt = createNarrativePrompt(context);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a dramatic narrator for the Squid Game. Create intense, suspenseful narratives that capture the deadly atmosphere of the games. Write in present tense, be descriptive, and build tension. Keep each narrative segment to 1-2 sentences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✨ Generated AI narrative for', round.name);
    return parseNarrativeResponse(response);
  } catch (error) {
    console.error('OpenAI narrative generation failed:', error);
    // Fallback to enhanced static narrative
    return generateEnhancedFallbackNarrative(context);
  }
}

/**
 * Create a detailed prompt for OpenAI narrative generation
 */
function createNarrativePrompt(context: NarrativeContext): string {
  const { round, roundNumber, contestants, survivors, eliminated } = context;

  // Create detailed contestant profiles
  const contestantProfiles = contestants.map(c => {
    return `${c.name}:
  - Personality: ${c.personality}
  - Trait: ${c.trait}
  - Description: ${c.description}
  - Stats: Strength ${c.stats.strength}, Agility ${c.stats.agility}, Intelligence ${c.stats.intelligence}, Deception ${c.stats.deception}, Luck ${c.stats.luck}
  - Status: ${survivors.includes(c) ? 'SURVIVOR' : eliminated.includes(c) ? 'ELIMINATED' : 'UNKNOWN'}`;
  }).join('\n\n');

  const survivorDetails = survivors.map(c =>
    `${c.name} (${c.personality}, ${c.trait})`
  ).join(', ');

  const eliminatedDetails = eliminated.map(c =>
    `${c.name} (${c.personality}, ${c.trait})`
  ).join(', ');

  return `
Generate a dramatic narrative for Round ${roundNumber} of Squid Game: "${round.name}".

GAME DETAILS:
- Round: ${round.name}
- Description: ${round.description}
- Round Number: ${roundNumber} of 5

CONTESTANT PROFILES:
${contestantProfiles}

ROUND OUTCOME:
- Survivors: ${survivorDetails || 'None'}
- Eliminated: ${eliminatedDetails || 'None'}
- Total eliminated this round: ${eliminated.length}

NARRATIVE REQUIREMENTS:
1. SETUP (2-3 sentences): Introduce the game, set the deadly atmosphere, describe the rules
2. ACTION (3-4 sentences): Describe intense gameplay, show how each contestant's personality/stats affect their performance
3. ELIMINATION (2-3 sentences): Describe how eliminated contestants failed, reference their specific traits/personalities
4. DRAMATIC_MOMENTS (1-2 sentences): Key dramatic highlights or shocking moments

IMPORTANT GUIDELINES:
- Reference specific contestant personalities and traits in the narrative
- Show how their stats (strength, agility, intelligence, etc.) influence their performance
- Make eliminations feel personal and tragic based on their characteristics
- Use present tense, vivid descriptions, emotional impact
- Tone: Suspenseful, dramatic, intense like the actual Squid Game show
- Make each contestant feel unique based on their profile

Format your response as:
SETUP:
[setup sentences]

ACTION:
[action sentences]

ELIMINATION:
[elimination sentences]

DRAMATIC_MOMENTS:
[dramatic moments]
`;
}

/**
 * Parse OpenAI response into structured narrative
 */
function parseNarrativeResponse(response: string): GeneratedNarrative {
  const sections = {
    setupNarrative: [] as string[],
    actionNarrative: [] as string[],
    eliminationNarrative: [] as string[],
    dramaticMoments: [] as string[]
  };

  const lines = response.split('\n').filter(line => line.trim());
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('SETUP:')) {
      currentSection = 'setup';
      continue;
    } else if (trimmed.startsWith('ACTION:')) {
      currentSection = 'action';
      continue;
    } else if (trimmed.startsWith('ELIMINATION:')) {
      currentSection = 'elimination';
      continue;
    } else if (trimmed.startsWith('DRAMATIC_MOMENTS:')) {
      currentSection = 'dramatic';
      continue;
    }

    if (trimmed && currentSection) {
      switch (currentSection) {
        case 'setup':
          sections.setupNarrative.push(trimmed);
          break;
        case 'action':
          sections.actionNarrative.push(trimmed);
          break;
        case 'elimination':
          sections.eliminationNarrative.push(trimmed);
          break;
        case 'dramatic':
          sections.dramaticMoments.push(trimmed);
          break;
      }
    }
  }

  return sections;
}

/**
 * Enhanced fallback narrative generation when OpenAI is not available
 */
function generateEnhancedFallbackNarrative(context: NarrativeContext): GeneratedNarrative {
  const { round, roundNumber, contestants, survivors, eliminated } = context;

  // Round-specific enhanced narratives
  const roundNarratives = {
    'Red Light Green Light': {
      setup: [
        `Round ${roundNumber}: ${round.name}`,
        `The massive doll towers over the playground, its mechanical eyes scanning for any movement.`,
        `${contestants.length} contestants line up at the starting line, hearts pounding with terror.`
      ],
      action: [
        `"Green light!" The doll's head turns away and contestants surge forward desperately.`,
        `Footsteps thunder across the field as players race toward the finish line.`,
        `"Red light!" The doll spins around, its sensors detecting the slightest motion.`,
        `Some contestants freeze perfectly, while others struggle to control their momentum.`
      ],
      dramatic: [`The price of movement is death, and the doll shows no mercy.`]
    },
    'Tug of War': {
      setup: [
        `Round ${roundNumber}: ${round.name}`,
        `Teams form on opposite sides of a deadly chasm, ropes their only lifeline.`,
        `The platform sways ominously as contestants realize the stakes.`
      ],
      action: [
        `The rope goes taut as both teams strain with everything they have.`,
        `Feet slide dangerously close to the edge as the battle intensifies.`,
        `Strategy and raw strength clash in this ultimate test of teamwork.`,
        `The losing team faces a terrifying plunge into the abyss below.`
      ],
      dramatic: [`In Tug of War, there are no individual heroes - only surviving teams.`]
    },
    'Marbles': {
      setup: [
        `Round ${roundNumber}: ${round.name}`,
        `Contestants pair up for what seems like a children's game.`,
        `The cruel reality sets in: only one from each pair will survive.`
      ],
      action: [
        `Friends become enemies as the marble games begin.`,
        `Deception and strategy intertwine in deadly combinations.`,
        `Some rely on luck, others on cunning manipulation.`,
        `Trust becomes a luxury no one can afford.`
      ],
      dramatic: [`The most heartbreaking eliminations come from betraying those closest to you.`]
    }
  };

  const narrativeSet = roundNarratives[round.type as keyof typeof roundNarratives] || {
    setup: [
      `Round ${roundNumber}: ${round.name}`,
      `The contestants face their next deadly challenge.`,
      `The rules are simple, but survival is anything but guaranteed.`
    ],
    action: [
      `The game begins with deadly precision.`,
      `Contestants struggle to survive the brutal challenge.`,
      `Every decision could be their last.`,
      `The weak are separated from the strong.`
    ],
    dramatic: [`The games show no mercy to those who fail.`]
  };

  // Generate personalized elimination narratives with stats
  const eliminationNarrative = eliminated.map(contestant => {
    const personalizedReasons = {
      'Red Light Green Light': [
        `${contestant.name}'s ${contestant.personality.toLowerCase()} nature betrayed them at the crucial moment, their agility of ${contestant.stats.agility} insufficient against the doll's sensors.`,
        `Despite being known as ${contestant.trait.toLowerCase()} with strength ${contestant.stats.strength}, ${contestant.name} couldn't overcome the deadly precision of the game.`,
        `${contestant.name}'s journey ends here, their ${contestant.personality.toLowerCase()} approach and intelligence of ${contestant.stats.intelligence} proving insufficient against the mechanical death.`
      ],
      'Tug of War': [
        `${contestant.name}'s team falls into the abyss, their ${contestant.trait.toLowerCase()} trait and strength of ${contestant.stats.strength} unable to save them from the deadly plunge.`,
        `The ${contestant.personality.toLowerCase()} ${contestant.name} meets their end in the deadly tug of war, their deception skills of ${contestant.stats.deception} useless against raw physics.`
      ],
      'Marbles': [
        `${contestant.name}'s ${contestant.personality.toLowerCase()} personality and deception score of ${contestant.stats.deception} couldn't navigate the psychological warfare of marbles.`,
        `Trust proved to be ${contestant.name}'s downfall in this game of betrayal, their intelligence of ${contestant.stats.intelligence} unable to read their opponent's true intentions.`
      ],
      'Glass Bridge': [
        `${contestant.name}'s luck of ${contestant.stats.luck} finally runs out on the glass bridge, their ${contestant.trait.toLowerCase()} nature leading them to the wrong panel.`,
        `The ${contestant.personality.toLowerCase()} ${contestant.name} falls through the glass, their agility of ${contestant.stats.agility} unable to save them from the deadly drop.`
      ],
      'Final Squid Game': [
        `${contestant.name}'s ${contestant.personality.toLowerCase()} approach and combined stats couldn't overcome their final opponent in the ultimate showdown.`,
        `Despite their ${contestant.trait.toLowerCase()} nature and strength of ${contestant.stats.strength}, ${contestant.name} falls in the final battle.`
      ]
    };

    const reasons = personalizedReasons[round.type as keyof typeof personalizedReasons] || [
      `${contestant.name} was eliminated, their ${contestant.trait.toLowerCase()} nature and stats (STR:${contestant.stats.strength}, AGI:${contestant.stats.agility}, INT:${contestant.stats.intelligence}) not enough to survive.`
    ];

    return reasons[Math.floor(Math.random() * reasons.length)];
  });

  return {
    setupNarrative: narrativeSet.setup,
    actionNarrative: narrativeSet.action,
    eliminationNarrative,
    dramaticMoments: narrativeSet.dramatic
  };
}

/**
 * Check if OpenAI is properly configured
 */
export function isOpenAIAvailable(): boolean {
  return isOpenAIConfigured;
}

/**
 * Get OpenAI configuration status for UI display
 */
export function getOpenAIStatus(): { configured: boolean; message: string } {
  if (isOpenAIConfigured) {
    return {
      configured: true,
      message: "✨ AI-powered narratives enabled"
    };
  } else {
    return {
      configured: false,
      message: "Using enhanced static narratives (set VITE_OPENAI_API_KEY for AI narratives)"
    };
  }
}

/**
 * Generate personalized elimination narrative for specific contestants
 */
export async function generateEliminationNarrative(
  contestant: Contestant,
  round: GameRound,
  eliminationReason?: string
): Promise<string> {
  try {
    const prompt = `
Generate a dramatic elimination narrative for ${contestant.name} in ${round.name}.

CONTESTANT PROFILE:
- Name: ${contestant.name}
- Personality: ${contestant.personality}
- Trait: ${contestant.trait}
- Description: ${contestant.description}
- Stats: Strength ${contestant.stats.strength}, Agility ${contestant.stats.agility}, Intelligence ${contestant.stats.intelligence}, Deception ${contestant.stats.deception}, Luck ${contestant.stats.luck}

GAME CONTEXT:
- Round: ${round.name}
- Description: ${round.description}
${eliminationReason ? `- Elimination Reason: ${eliminationReason}` : ''}

REQUIREMENTS:
- Write 1-2 dramatic sentences describing their elimination
- Reference their specific personality/trait and how it led to their downfall
- Show how their stats influenced their failure
- Make it emotional and impactful in Squid Game style
- Use present tense, vivid descriptions

Example style: "Jihoon's cautious nature, usually his strength, becomes his weakness as he hesitates too long at the crucial moment. His high intelligence couldn't save him from the deadly precision of the game's rules."
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a dramatic narrator for Squid Game. Write emotional, impactful elimination descriptions that reference contestant personalities and stats."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.9,
    });

    return completion.choices[0]?.message?.content ||
           `${contestant.name} was eliminated from ${round.name}.`;
  } catch (error) {
    console.error('Failed to generate elimination narrative:', error);
    return `${contestant.name} was eliminated from ${round.name}.`;
  }
}

/**
 * Generate dramatic winner announcement
 */
export async function generateWinnerNarrative(winner: Contestant): Promise<string> {
  try {
    const prompt = `
Generate a dramatic winner announcement for ${winner.name} who has won the Squid Game.

WINNER PROFILE:
- Name: ${winner.name}
- Personality: ${winner.personality}
- Trait: ${winner.trait}
- Description: ${winner.description}
- Stats: Strength ${winner.stats.strength}, Agility ${winner.stats.agility}, Intelligence ${winner.stats.intelligence}, Deception ${winner.stats.deception}, Luck ${winner.stats.luck}

REQUIREMENTS:
- Write 2-3 dramatic sentences announcing their victory
- Reference their specific personality/trait and how it helped them survive
- Show how their stats contributed to their success
- Make it triumphant and emotional in Squid Game style
- Explain what made them the ultimate survivor

Example style: "Jihoon's cautious nature and exceptional intelligence proved to be the perfect combination for survival. His methodical approach and high agility allowed him to navigate every deadly challenge, emerging as the sole victor of these twisted games."
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are announcing the winner of Squid Game. Be dramatic, triumphant, and reference their specific characteristics that led to victory."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 250,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content ||
           `${winner.name} emerges victorious from the deadly games!`;
  } catch (error) {
    console.error('Failed to generate winner narrative:', error);
    return `${winner.name} emerges victorious from the deadly games!`;
  }
}

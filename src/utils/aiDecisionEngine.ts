import type { Contestant, GameRound, DecisionContext, AIDecision, PersonalityType, TraitType } from '../types/index';

// Main AI decision function
export function makeAIDecision(context: DecisionContext): AIDecision {
  const { contestant, currentRound, remainingContestants, roundNumber } = context;
  
  // Get personality-based decision
  const personalityDecision = getPersonalityDecision(contestant, currentRound, remainingContestants);
  
  // Get trait-based modifiers
  const traitModifier = getTraitModifier(contestant, currentRound);
  
  // Combine decisions
  const finalDecision: AIDecision = {
    action: personalityDecision.action,
    reasoning: `${personalityDecision.reasoning} ${traitModifier.reasoning}`,
    confidence: Math.min(1, personalityDecision.confidence + traitModifier.confidenceBonus),
    riskLevel: calculateRiskLevel(contestant, currentRound, personalityDecision.riskLevel)
  };
  
  return finalDecision;
}

// Get decision based on personality
function getPersonalityDecision(
  contestant: Contestant, 
  round: GameRound, 
  remainingContestants: Contestant[]
): Omit<AIDecision, 'riskLevel'> & { riskLevel: 'low' | 'medium' | 'high' } {
  
  const decisions: Record<PersonalityType, Record<string, Omit<AIDecision, 'riskLevel'> & { riskLevel: 'low' | 'medium' | 'high' }>> = {
    'Cautious': {
      'Red Light Green Light': {
        action: 'Move slowly and carefully, waiting for others to test the timing',
        reasoning: `${contestant.name} prefers to observe others and minimize risk.`,
        confidence: 0.8,
        riskLevel: 'low'
      },
      'Tug of War': {
        action: 'Form alliance with strongest available contestants',
        reasoning: `${contestant.name} seeks safety in numbers and proven strength.`,
        confidence: 0.7,
        riskLevel: 'low'
      },
      'Marbles': {
        action: 'Choose a partner carefully, avoid deception unless necessary',
        reasoning: `${contestant.name} values trust but will do what it takes to survive.`,
        confidence: 0.6,
        riskLevel: 'medium'
      },
      'Glass Bridge': {
        action: 'Go later in the order, learn from others\' mistakes',
        reasoning: `${contestant.name} wants to gather as much information as possible.`,
        confidence: 0.9,
        riskLevel: 'low'
      },
      'Final Squid Game': {
        action: 'Play defensively, wait for opponent to make mistakes',
        reasoning: `${contestant.name} relies on patience and opponent errors.`,
        confidence: 0.7,
        riskLevel: 'medium'
      }
    },
    'Ambitious': {
      'Red Light Green Light': {
        action: 'Move aggressively when confident, take calculated risks',
        reasoning: `${contestant.name} sees opportunity where others see danger.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Try to lead team formation and strategy',
        reasoning: `${contestant.name} wants to control the situation and maximize winning chances.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Marbles': {
        action: 'Use psychological manipulation to win',
        reasoning: `${contestant.name} will exploit any advantage to secure victory.`,
        confidence: 0.9,
        riskLevel: 'high'
      },
      'Glass Bridge': {
        action: 'Volunteer to go early if confident in abilities',
        reasoning: `${contestant.name} believes in their skills and wants to control their fate.`,
        confidence: 0.6,
        riskLevel: 'high'
      },
      'Final Squid Game': {
        action: 'Play aggressively to dominate the opponent',
        reasoning: `${contestant.name} goes all-out for the ultimate prize.`,
        confidence: 0.8,
        riskLevel: 'high'
      }
    },
    'Loyal': {
      'Red Light Green Light': {
        action: 'Help others when possible, move as a group',
        reasoning: `${contestant.name} believes in collective survival.`,
        confidence: 0.6,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Protect allies and work as a cohesive team',
        reasoning: `${contestant.name} prioritizes team success over individual glory.`,
        confidence: 0.9,
        riskLevel: 'low'
      },
      'Marbles': {
        action: 'Struggle with betraying partner, may sacrifice self',
        reasoning: `${contestant.name} finds it difficult to betray someone they\'ve bonded with.`,
        confidence: 0.4,
        riskLevel: 'high'
      },
      'Glass Bridge': {
        action: 'Volunteer to go first to protect others',
        reasoning: `${contestant.name} is willing to sacrifice themselves for others.`,
        confidence: 0.7,
        riskLevel: 'high'
      },
      'Final Squid Game': {
        action: 'Fight with honor, avoid dirty tactics',
        reasoning: `${contestant.name} maintains their principles even in the final moment.`,
        confidence: 0.6,
        riskLevel: 'medium'
      }
    },
    'Calculating': {
      'Red Light Green Light': {
        action: 'Analyze the doll\'s timing pattern before moving',
        reasoning: `${contestant.name} studies the system to find the optimal strategy.`,
        confidence: 0.9,
        riskLevel: 'low'
      },
      'Tug of War': {
        action: 'Calculate team compositions and choose strategically',
        reasoning: `${contestant.name} analyzes everyone\'s strengths to form the best team.`,
        confidence: 0.8,
        riskLevel: 'low'
      },
      'Marbles': {
        action: 'Use complex psychological strategies and misdirection',
        reasoning: `${contestant.name} employs sophisticated mental tactics.`,
        confidence: 0.9,
        riskLevel: 'medium'
      },
      'Glass Bridge': {
        action: 'Study the glass patterns and make educated guesses',
        reasoning: `${contestant.name} looks for visual cues and patterns in the glass.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Final Squid Game': {
        action: 'Analyze opponent\'s weaknesses and exploit them systematically',
        reasoning: `${contestant.name} turns the final game into a chess match.`,
        confidence: 0.9,
        riskLevel: 'medium'
      }
    },
    'Reckless': {
      'Red Light Green Light': {
        action: 'Move fast and early, trust in reflexes',
        reasoning: `${contestant.name} relies on speed and instinct over caution.`,
        confidence: 0.6,
        riskLevel: 'high'
      },
      'Tug of War': {
        action: 'Join any team quickly, focus on raw strength',
        reasoning: `${contestant.name} believes brute force will win the day.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Marbles': {
        action: 'Make bold, risky plays to win quickly',
        reasoning: `${contestant.name} goes for high-risk, high-reward strategies.`,
        confidence: 0.5,
        riskLevel: 'high'
      },
      'Glass Bridge': {
        action: 'Volunteer to go first, trust in luck',
        reasoning: `${contestant.name} prefers action over waiting and worrying.`,
        confidence: 0.4,
        riskLevel: 'high'
      },
      'Final Squid Game': {
        action: 'Attack aggressively from the start',
        reasoning: `${contestant.name} believes the best defense is a strong offense.`,
        confidence: 0.7,
        riskLevel: 'high'
      }
    },
    'Empathetic': {
      'Red Light Green Light': {
        action: 'Help others and move together when possible',
        reasoning: `${contestant.name} can\'t bear to see others suffer alone.`,
        confidence: 0.5,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Include weaker contestants in team formation',
        reasoning: `${contestant.name} believes everyone deserves a chance.`,
        confidence: 0.6,
        riskLevel: 'medium'
      },
      'Marbles': {
        action: 'Struggle emotionally, may let partner win',
        reasoning: `${contestant.name} finds it nearly impossible to eliminate someone face-to-face.`,
        confidence: 0.3,
        riskLevel: 'high'
      },
      'Glass Bridge': {
        action: 'Encourage others and share observations',
        reasoning: `${contestant.name} wants to help everyone survive if possible.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Final Squid Game': {
        action: 'Hesitate and show mercy when possible',
        reasoning: `${contestant.name} struggles with the violent nature of the final game.`,
        confidence: 0.4,
        riskLevel: 'high'
      }
    },
    'Aggressive': {
      'Red Light Green Light': {
        action: 'Push through aggressively, intimidate others',
        reasoning: `${contestant.name} uses force and intimidation as primary tools.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Dominate team selection and strategy',
        reasoning: `${contestant.name} takes charge through force of personality.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Marbles': {
        action: 'Intimidate partner and use aggressive tactics',
        reasoning: `${contestant.name} tries to psychologically dominate their opponent.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Glass Bridge': {
        action: 'Push others ahead or fight for better position',
        reasoning: `${contestant.name} is willing to sacrifice others for their own survival.`,
        confidence: 0.6,
        riskLevel: 'high'
      },
      'Final Squid Game': {
        action: 'Use maximum force and aggression',
        reasoning: `${contestant.name} is in their element in direct combat.`,
        confidence: 0.9,
        riskLevel: 'high'
      }
    },
    'Lucky': {
      'Red Light Green Light': {
        action: 'Trust in good fortune and move when it feels right',
        reasoning: `${contestant.name} relies on their supernatural luck.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Join whichever team feels right intuitively',
        reasoning: `${contestant.name} trusts their instincts over analysis.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Marbles': {
        action: 'Make random choices and trust in fortune',
        reasoning: `${contestant.name} believes luck will guide them to victory.`,
        confidence: 0.9,
        riskLevel: 'high'
      },
      'Glass Bridge': {
        action: 'Choose panels based on gut feeling',
        reasoning: `${contestant.name} trusts their lucky streak to continue.`,
        confidence: 0.8,
        riskLevel: 'high'
      },
      'Final Squid Game': {
        action: 'Play instinctively and hope for the best',
        reasoning: `${contestant.name} believes their luck will see them through.`,
        confidence: 0.7,
        riskLevel: 'medium'
      }
    },
    'Deceptive': {
      'Red Light Green Light': {
        action: 'Mislead others about timing while moving safely',
        reasoning: `${contestant.name} uses misdirection to gain advantages.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Manipulate team formation to their advantage',
        reasoning: `${contestant.name} ensures they\'re on the strongest team through deception.`,
        confidence: 0.9,
        riskLevel: 'low'
      },
      'Marbles': {
        action: 'Use elaborate lies and psychological manipulation',
        reasoning: `${contestant.name} is a master of deception and mind games.`,
        confidence: 0.9,
        riskLevel: 'medium'
      },
      'Glass Bridge': {
        action: 'Mislead others about glass observations',
        reasoning: `${contestant.name} gives false information to protect themselves.`,
        confidence: 0.7,
        riskLevel: 'medium'
      },
      'Final Squid Game': {
        action: 'Use psychological warfare and misdirection',
        reasoning: `${contestant.name} tries to confuse and disorient their opponent.`,
        confidence: 0.8,
        riskLevel: 'medium'
      }
    },
    'Resourceful': {
      'Red Light Green Light': {
        action: 'Use environment and other players as shields/guides',
        reasoning: `${contestant.name} adapts to use every available advantage.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Tug of War': {
        action: 'Suggest creative strategies and positioning',
        reasoning: `${contestant.name} thinks outside the box for team tactics.`,
        confidence: 0.8,
        riskLevel: 'low'
      },
      'Marbles': {
        action: 'Adapt strategy based on partner\'s personality',
        reasoning: `${contestant.name} quickly reads their opponent and adjusts tactics.`,
        confidence: 0.8,
        riskLevel: 'medium'
      },
      'Glass Bridge': {
        action: 'Use creative methods to test glass safety',
        reasoning: `${contestant.name} finds innovative ways to identify safe panels.`,
        confidence: 0.9,
        riskLevel: 'medium'
      },
      'Final Squid Game': {
        action: 'Adapt tactics based on opponent\'s style',
        reasoning: `${contestant.name} quickly adjusts to counter their opponent\'s strategy.`,
        confidence: 0.8,
        riskLevel: 'medium'
      }
    }
  };
  
  return decisions[contestant.personality][round.name] || {
    action: 'Play cautiously and adapt to the situation',
    reasoning: `${contestant.name} takes a measured approach.`,
    confidence: 0.5,
    riskLevel: 'medium'
  };
}

// Get trait-based modifiers
function getTraitModifier(contestant: Contestant, round: GameRound): { reasoning: string; confidenceBonus: number } {
  const traitModifiers: Record<TraitType, { reasoning: string; confidenceBonus: number }> = {
    'Survivor': { reasoning: 'Their survival instincts are finely tuned.', confidenceBonus: 0.1 },
    'Opportunist': { reasoning: 'They excel at finding and exploiting opportunities.', confidenceBonus: 0.1 },
    'Protector': { reasoning: 'Their protective nature drives their decisions.', confidenceBonus: 0.0 },
    'Strategist': { reasoning: 'Their strategic mind gives them an edge.', confidenceBonus: 0.2 },
    'Daredevil': { reasoning: 'Their love of risk makes them unpredictable.', confidenceBonus: -0.1 },
    'Peacemaker': { reasoning: 'Their desire for harmony may be a weakness here.', confidenceBonus: -0.1 },
    'Challenger': { reasoning: 'They thrive in confrontational situations.', confidenceBonus: 0.1 },
    'Fortunate': { reasoning: 'Lady luck seems to smile upon them.', confidenceBonus: 0.1 },
    'Liar': { reasoning: 'Their deceptive skills are perfectly suited for this.', confidenceBonus: 0.1 },
    'Improviser': { reasoning: 'They adapt quickly to changing circumstances.', confidenceBonus: 0.1 }
  };
  
  return traitModifiers[contestant.trait];
}

// Calculate final risk level
function calculateRiskLevel(
  contestant: Contestant, 
  round: GameRound, 
  baseRiskLevel: 'low' | 'medium' | 'high'
): 'low' | 'medium' | 'high' {
  // Personality can modify risk tolerance
  const riskModifiers: Record<PersonalityType, number> = {
    'Cautious': -1,
    'Ambitious': 0,
    'Loyal': 0,
    'Calculating': -1,
    'Reckless': 1,
    'Empathetic': 0,
    'Aggressive': 1,
    'Lucky': 0,
    'Deceptive': 0,
    'Resourceful': 0
  };
  
  const riskLevels = ['low', 'medium', 'high'];
  const currentIndex = riskLevels.indexOf(baseRiskLevel);
  const modifier = riskModifiers[contestant.personality];
  const newIndex = Math.max(0, Math.min(2, currentIndex + modifier));
  
  return riskLevels[newIndex] as 'low' | 'medium' | 'high';
}

import { describe, it, expect, beforeEach } from 'vitest'
import { calculateRoundEffectiveness, updateContestantOdds } from '../contestantUtils'
import type { Contestant, GameRound } from '../../types'

describe('ContestantUtils', () => {
  let contestant: Contestant
  let round: GameRound

  beforeEach(() => {
    contestant = {
      id: 'test-player',
      name: 'Test Player',
      personality: 'Cautious',
      trait: 'Survivor',
      description: 'A test contestant',
      status: 'alive',
      stats: {
        strength: 5,
        intelligence: 7,
        luck: 6,
        charisma: 8,
        agility: 4,
        deception: 3
      },
      relationships: {
        allies: [],
        enemies: [],
        neutral: []
      },
      roundsParticipated: [],
      currentOdds: 2.5,
      totalBetsPlaced: 0
    }

    round = {
      type: 'Red Light Green Light',
      name: 'Red Light, Green Light',
      description: 'Speed and intelligence test',
      eliminationCount: 2,
      primaryStats: ['agility', 'intelligence'],
      secondaryStats: ['luck'],
      allowsAlliances: false,
      requiresTeamwork: false,
      hasRandomElement: true
    }
  })

  describe('calculateRoundEffectiveness', () => {
    it('should calculate effectiveness based on primary and secondary stats', () => {
      const effectiveness = calculateRoundEffectiveness(contestant, round)
      
      // Primary stats: agility (4) * 2 + intelligence (7) * 2 = 22
      // Secondary stats: luck (6) * 1 = 6
      // Plus personality and trait modifiers
      expect(effectiveness).toBeGreaterThan(28) // Base 28 + modifiers
      expect(effectiveness).toBeLessThan(50) // Reasonable upper bound
    })

    it('should weight primary stats more than secondary stats', () => {
      const highPrimaryStats = {
        ...contestant,
        stats: {
          ...contestant.stats,
          agility: 10,
          intelligence: 10,
          luck: 1
        }
      }

      const highSecondaryStats = {
        ...contestant,
        stats: {
          ...contestant.stats,
          agility: 1,
          intelligence: 1,
          luck: 10
        }
      }

      const primaryEffectiveness = calculateRoundEffectiveness(highPrimaryStats, round)
      const secondaryEffectiveness = calculateRoundEffectiveness(highSecondaryStats, round)

      expect(primaryEffectiveness).toBeGreaterThan(secondaryEffectiveness)
    })

    it('should apply personality modifiers correctly', () => {
      const cautiousContestant = { ...contestant, personality: 'Cautious' as const }
      const recklessContestant = { ...contestant, personality: 'Reckless' as const }

      const cautiousEffectiveness = calculateRoundEffectiveness(cautiousContestant, round)
      const recklessEffectiveness = calculateRoundEffectiveness(recklessContestant, round)

      // Cautious should be better at Red Light Green Light
      expect(cautiousEffectiveness).toBeGreaterThan(recklessEffectiveness)
    })

    it('should apply trait modifiers correctly', () => {
      const survivorContestant = { ...contestant, trait: 'Survivor' as const }
      const daredevilContestant = { ...contestant, trait: 'Daredevil' as const }

      const survivorEffectiveness = calculateRoundEffectiveness(survivorContestant, round)
      const daredevilEffectiveness = calculateRoundEffectiveness(daredevilContestant, round)

      // Both should have some effectiveness, but may differ based on round type
      expect(survivorEffectiveness).toBeGreaterThan(0)
      expect(daredevilEffectiveness).toBeGreaterThan(0)
    })

    it('should never return negative effectiveness', () => {
      const weakContestant = {
        ...contestant,
        stats: {
          strength: 1,
          intelligence: 1,
          luck: 1,
          charisma: 1,
          agility: 1,
          deception: 1
        }
      }

      const effectiveness = calculateRoundEffectiveness(weakContestant, round)
      expect(effectiveness).toBeGreaterThanOrEqual(0)
    })

    it('should handle different round types', () => {
      const tugOfWarRound: GameRound = {
        type: 'Tug of War',
        name: 'Tug of War',
        description: 'Strength test',
        eliminationCount: 3,
        primaryStats: ['strength', 'charisma'],
        secondaryStats: ['intelligence'],
        allowsAlliances: true,
        requiresTeamwork: true,
        hasRandomElement: false
      }

      const redLightEffectiveness = calculateRoundEffectiveness(contestant, round)
      const tugOfWarEffectiveness = calculateRoundEffectiveness(contestant, tugOfWarRound)

      // Should get different effectiveness for different rounds
      expect(redLightEffectiveness).not.toBe(tugOfWarEffectiveness)
    })

    it('should favor contestants with relevant stats for specific rounds', () => {
      const agilityFocused = {
        ...contestant,
        stats: { ...contestant.stats, agility: 10, strength: 1 }
      }

      const strengthFocused = {
        ...contestant,
        stats: { ...contestant.stats, agility: 1, strength: 10 }
      }

      const redLightRound = round // Favors agility
      const tugOfWarRound: GameRound = {
        type: 'Tug of War',
        name: 'Tug of War',
        description: 'Strength test',
        eliminationCount: 3,
        primaryStats: ['strength'],
        secondaryStats: [],
        allowsAlliances: true,
        requiresTeamwork: true,
        hasRandomElement: false
      }

      const agilityInRedLight = calculateRoundEffectiveness(agilityFocused, redLightRound)
      const strengthInRedLight = calculateRoundEffectiveness(strengthFocused, redLightRound)
      const agilityInTugOfWar = calculateRoundEffectiveness(agilityFocused, tugOfWarRound)
      const strengthInTugOfWar = calculateRoundEffectiveness(strengthFocused, tugOfWarRound)

      expect(agilityInRedLight).toBeGreaterThan(strengthInRedLight)
      expect(strengthInTugOfWar).toBeGreaterThan(agilityInTugOfWar)
    })
  })

  describe('updateContestantOdds', () => {
    it('should update odds based on performance', () => {
      const contestants = [contestant]
      const originalOdds = contestant.currentOdds

      updateContestantOdds(contestants, round, 1)

      // Odds should be updated (either higher or lower)
      expect(contestant.currentOdds).not.toBe(originalOdds)
      expect(contestant.currentOdds).toBeGreaterThan(1)
    })

    it('should maintain reasonable odds range', () => {
      const contestants = [contestant]

      updateContestantOdds(contestants, round, 1)

      expect(contestant.currentOdds).toBeGreaterThan(1.1)
      expect(contestant.currentOdds).toBeLessThan(20)
    })
  })
})

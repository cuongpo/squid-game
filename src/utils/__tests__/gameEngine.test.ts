import { describe, it, expect, beforeEach } from 'vitest'
import { simulateRoundSync as simulateRound } from '../gameEngine'
import type { Contestant, GameRound } from '../../types'

describe('GameEngine', () => {
  let contestants: Contestant[]
  let mockRound: GameRound

  beforeEach(() => {
    contestants = [
      {
        id: 'player1',
        name: 'Player 1',
        personality: 'Cautious',
        trait: 'Survivor',
        description: 'Test player 1',
        status: 'alive',
        stats: {
          strength: 8,
          intelligence: 7,
          luck: 6,
          charisma: 5,
          agility: 9,
          deception: 4
        },
        relationships: { allies: [], enemies: [], neutral: [] },
        roundsParticipated: [],
        currentOdds: 2.5,
        totalBetsPlaced: 0
      },
      {
        id: 'player2',
        name: 'Player 2',
        personality: 'Aggressive',
        trait: 'Challenger',
        description: 'Test player 2',
        status: 'alive',
        stats: {
          strength: 6,
          intelligence: 5,
          luck: 4,
          charisma: 7,
          agility: 3,
          deception: 8
        },
        relationships: { allies: [], enemies: [], neutral: [] },
        roundsParticipated: [],
        currentOdds: 3.0,
        totalBetsPlaced: 0
      },
      {
        id: 'player3',
        name: 'Player 3',
        personality: 'Lucky',
        trait: 'Fortunate',
        description: 'Test player 3',
        status: 'alive',
        stats: {
          strength: 4,
          intelligence: 6,
          luck: 10,
          charisma: 6,
          agility: 5,
          deception: 3
        },
        relationships: { allies: [], enemies: [], neutral: [] },
        roundsParticipated: [],
        currentOdds: 4.0,
        totalBetsPlaced: 0
      }
    ]

    mockRound = {
      type: 'Red Light Green Light',
      name: 'Red Light, Green Light',
      description: 'Test round',
      eliminationCount: 2,
      primaryStats: ['agility', 'intelligence'],
      secondaryStats: ['luck'],
      allowsAlliances: false,
      requiresTeamwork: false,
      hasRandomElement: true
    }
  })

  describe('simulateRound', () => {
    it('should return correct structure', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      expect(result).toHaveProperty('survivors')
      expect(result).toHaveProperty('eliminated')
      expect(result).toHaveProperty('events')
      expect(result).toHaveProperty('narrative')
      
      expect(Array.isArray(result.survivors)).toBe(true)
      expect(Array.isArray(result.eliminated)).toBe(true)
      expect(Array.isArray(result.events)).toBe(true)
      expect(Array.isArray(result.narrative)).toBe(true)
    })

    it('should eliminate the correct number of contestants', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      expect(result.eliminated.length).toBe(mockRound.eliminationCount)
      expect(result.survivors.length).toBe(contestants.length - mockRound.eliminationCount)
    })

    it('should mark eliminated contestants as eliminated', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      result.eliminated.forEach(contestant => {
        expect(contestant.status).toBe('eliminated')
        expect(contestant.eliminationRound).toBe(mockRound.type)
      })
    })

    it('should keep survivors as alive', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      result.survivors.forEach(contestant => {
        expect(contestant.status).toBe('alive')
        expect(contestant.eliminationRound).toBeUndefined()
      })
    })

    it('should update roundsParticipated for all contestants', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      const allContestants = [...result.survivors, ...result.eliminated]
      allContestants.forEach(contestant => {
        expect(contestant.roundsParticipated).toContain(mockRound.type)
      })
    })

    it('should generate narrative for the round', () => {
      const result = simulateRound(contestants, mockRound, 1)
      
      expect(result.narrative.length).toBeGreaterThan(0)
      expect(result.narrative[0]).toContain('Red Light, Green Light')
    })

    it('should handle edge case with no contestants', () => {
      const result = simulateRound([], mockRound, 1)
      
      expect(result.survivors).toEqual([])
      expect(result.eliminated).toEqual([])
      expect(result.events).toEqual([])
      expect(result.narrative.length).toBeGreaterThan(0)
    })

    it('should handle case where elimination count exceeds contestants', () => {
      const highEliminationRound = {
        ...mockRound,
        eliminationCount: 10 // More than available contestants
      }
      
      const result = simulateRound(contestants, highEliminationRound, 1)
      
      expect(result.eliminated.length).toBeLessThanOrEqual(contestants.length)
      expect(result.survivors.length).toBeGreaterThanOrEqual(0)
    })

    it('should only process alive contestants', () => {
      const contestantsWithEliminated = [
        ...contestants,
        {
          ...contestants[0],
          id: 'eliminated-player',
          status: 'eliminated' as const
        }
      ]
      
      const result = simulateRound(contestantsWithEliminated, mockRound, 1)
      
      // Should only process the 3 alive contestants, not the eliminated one
      expect(result.survivors.length + result.eliminated.length).toBe(3)
    })
  })

  describe('different round types', () => {
    it('should handle Tug of War round', () => {
      const tugOfWarRound: GameRound = {
        type: 'Tug of War',
        name: 'Tug of War',
        description: 'Team battle',
        eliminationCount: 1,
        primaryStats: ['strength', 'charisma'],
        secondaryStats: ['intelligence'],
        allowsAlliances: true,
        requiresTeamwork: true,
        hasRandomElement: false
      }
      
      const result = simulateRound(contestants, tugOfWarRound, 2)
      
      expect(result.eliminated.length).toBe(1)
      expect(result.narrative[0]).toContain('Tug of War')
    })

    it('should handle Marbles round', () => {
      const marblesRound: GameRound = {
        type: 'Marbles',
        name: 'Marbles',
        description: 'Pairing game',
        eliminationCount: 1,
        primaryStats: ['intelligence', 'deception'],
        secondaryStats: ['luck', 'charisma'],
        allowsAlliances: true,
        requiresTeamwork: false,
        hasRandomElement: true
      }
      
      const result = simulateRound(contestants, marblesRound, 3)
      
      expect(result.eliminated.length).toBe(1)
      expect(result.narrative[0]).toContain('Marbles')
    })
  })
})

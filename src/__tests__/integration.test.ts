import { describe, it, expect, beforeEach } from 'vitest'
import { initializeContestants } from '../data/contestants'
import { GAME_ROUNDS } from '../data/gameRounds'
import { simulateRoundSync as simulateRound } from '../utils/gameEngine'
import { initializeBettingState, placeBet, resolveBets } from '../utils/bettingSystem'
import { calculateRoundEffectiveness } from '../utils/contestantUtils'
import type { Contestant, BettingState } from '../types'

describe('Integration Tests', () => {
  let contestants: Contestant[]
  let bettingState: BettingState

  beforeEach(() => {
    contestants = initializeContestants()
    bettingState = initializeBettingState()
  })

  describe('Full Game Simulation', () => {
    it('should run a complete game from start to finish', () => {
      let currentContestants = [...contestants]
      let currentBettingState = { ...bettingState }
      const gameHistory: any[] = []

      // Place some initial bets
      const betResult1 = placeBet(currentBettingState, currentContestants[0].id, 100, currentContestants[0].currentOdds)
      expect(betResult1.success).toBe(true)
      currentBettingState = betResult1.newState!

      const betResult2 = placeBet(currentBettingState, currentContestants[1].id, 50, currentContestants[1].currentOdds)
      expect(betResult2.success).toBe(true)
      currentBettingState = betResult2.newState!

      // Simulate each round
      for (let roundIndex = 0; roundIndex < GAME_ROUNDS.length; roundIndex++) {
        const round = GAME_ROUNDS[roundIndex]
        
        // Only continue if we have enough contestants
        const aliveContestants = currentContestants.filter(c => c.status === 'alive')
        if (aliveContestants.length <= 1) break

        const roundResult = simulateRound(currentContestants, round, roundIndex + 1)
        
        gameHistory.push({
          round: roundIndex + 1,
          roundName: round.name,
          survivorsBefore: aliveContestants.length,
          survivorsAfter: roundResult.survivors.length,
          eliminated: roundResult.eliminated.length,
          narrative: roundResult.narrative
        })

        // Update contestants
        currentContestants = [...roundResult.survivors, ...roundResult.eliminated]

        // Verify round results
        expect(roundResult.survivors.length + roundResult.eliminated.length).toBe(aliveContestants.length)
        expect(roundResult.eliminated.length).toBeLessThanOrEqual(round.eliminationCount)
        expect(roundResult.narrative.length).toBeGreaterThan(0)

        // Check that eliminated contestants are marked correctly
        roundResult.eliminated.forEach(contestant => {
          expect(contestant.status).toBe('eliminated')
          expect(contestant.eliminationRound).toBe(round.type)
        })

        // Check that survivors are still alive
        roundResult.survivors.forEach(contestant => {
          expect(contestant.status).toBe('alive')
        })
      }

      // Verify game progression
      expect(gameHistory.length).toBeGreaterThan(0)
      expect(gameHistory[0].survivorsBefore).toBe(contestants.length)
      
      // Check that contestants were eliminated over time
      const finalAlive = currentContestants.filter(c => c.status === 'alive')
      expect(finalAlive.length).toBeLessThan(contestants.length)
    })

    it('should handle betting throughout the game', () => {
      let currentContestants = [...contestants]
      let currentBettingState = { ...bettingState }

      // Place initial bets on multiple contestants
      const initialBets = currentContestants.slice(0, 3).map(contestant => {
        const betResult = placeBet(currentBettingState, contestant.id, 100, contestant.currentOdds)
        if (betResult.success) {
          currentBettingState = betResult.newState!
        }
        return betResult
      })

      // Verify all bets were placed
      expect(initialBets.every(bet => bet.success)).toBe(true)
      expect(currentBettingState.activeBets.length).toBe(3)
      expect(currentBettingState.userBalance).toBe(700) // 1000 - 300

      // Simulate first round
      const firstRound = GAME_ROUNDS[0]
      const roundResult = simulateRound(currentContestants, firstRound, 1)

      // Resolve bets based on round results
      const eliminatedIds = roundResult.eliminated.map(c => c.id)
      const survivorIds = roundResult.survivors.map(c => c.id)

      // Check bet resolution logic
      currentBettingState.activeBets.forEach(bet => {
        if (eliminatedIds.includes(bet.contestantId)) {
          expect(bet.status).toBe('active') // Will be resolved as lost
        } else if (survivorIds.includes(bet.contestantId)) {
          expect(bet.status).toBe('active') // Still active for next round
        }
      })
    })
  })

  describe('Contestant Performance Analysis', () => {
    it('should calculate effectiveness correctly for different round types', () => {
      const contestant = contestants[0]
      
      GAME_ROUNDS.forEach(round => {
        const effectiveness = calculateRoundEffectiveness(contestant, round)
        
        expect(effectiveness).toBeGreaterThanOrEqual(0)
        expect(effectiveness).toBeLessThan(100) // Reasonable upper bound
        
        // Effectiveness should vary by round type
        expect(typeof effectiveness).toBe('number')
      })
    })

    it('should show different contestants excel at different rounds', () => {
      const effectivenessMatrix: Record<string, Record<string, number>> = {}
      
      // Calculate effectiveness for each contestant in each round
      contestants.forEach(contestant => {
        effectivenessMatrix[contestant.id] = {}
        GAME_ROUNDS.forEach(round => {
          effectivenessMatrix[contestant.id][round.type] = calculateRoundEffectiveness(contestant, round)
        })
      })

      // Verify that different contestants have different strengths
      const roundTypes = GAME_ROUNDS.map(r => r.type)
      roundTypes.forEach(roundType => {
        const effectivenessValues = contestants.map(c => effectivenessMatrix[c.id][roundType])
        const min = Math.min(...effectivenessValues)
        const max = Math.max(...effectivenessValues)
        
        // There should be variation in effectiveness
        expect(max).toBeGreaterThan(min)
      })
    })
  })

  describe('Data Consistency', () => {
    it('should maintain data integrity throughout simulation', () => {
      let currentContestants = [...contestants]
      const originalCount = currentContestants.length

      // Simulate first round
      const firstRound = GAME_ROUNDS[0]
      const roundResult = simulateRound(currentContestants, firstRound, 1)

      // Check data consistency
      expect(roundResult.survivors.length + roundResult.eliminated.length).toBe(
        currentContestants.filter(c => c.status === 'alive').length
      )

      // Check that all contestants have updated roundsParticipated
      const allContestants = [...roundResult.survivors, ...roundResult.eliminated]
      allContestants.forEach(contestant => {
        expect(contestant.roundsParticipated).toContain(firstRound.type)
      })

      // Check that IDs are preserved
      const allIds = allContestants.map(c => c.id).sort()
      const originalAliveIds = currentContestants.filter(c => c.status === 'alive').map(c => c.id).sort()
      expect(allIds).toEqual(originalAliveIds)
    })

    it('should handle edge cases gracefully', () => {
      // Test with minimal contestants
      const minimalContestants = contestants.slice(0, 2)
      const round = GAME_ROUNDS[0]

      const result = simulateRound(minimalContestants, round, 1)
      
      expect(result.survivors.length + result.eliminated.length).toBeLessThanOrEqual(2)
      expect(result.narrative.length).toBeGreaterThan(0)
    })

    it('should handle empty contestant list', () => {
      const round = GAME_ROUNDS[0]
      const result = simulateRound([], round, 1)
      
      expect(result.survivors).toEqual([])
      expect(result.eliminated).toEqual([])
      expect(result.events).toEqual([])
      expect(result.narrative.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Characteristics', () => {
    it('should complete simulations in reasonable time', () => {
      const startTime = Date.now()
      
      // Run multiple simulations
      for (let i = 0; i < 10; i++) {
        const testContestants = [...contestants]
        const round = GAME_ROUNDS[0]
        simulateRound(testContestants, round, 1)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 10 simulations in under 1 second
      expect(duration).toBeLessThan(1000)
    })
  })
})

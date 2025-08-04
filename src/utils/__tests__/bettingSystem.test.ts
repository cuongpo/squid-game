import { describe, it, expect, beforeEach } from 'vitest'
import {
  initializeBettingState,
  placeBet,
  cancelBet,
  resolveBets,
  calculateDynamicOdds
} from '../bettingSystem'
import type { BettingState, Contestant } from '../../types'

describe('BettingSystem', () => {
  let bettingState: BettingState
  let mockContestant: Contestant

  beforeEach(() => {
    bettingState = initializeBettingState()
    mockContestant = {
      id: 'test-contestant',
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
  })

  describe('initializeBettingState', () => {
    it('should initialize with correct default values', () => {
      const state = initializeBettingState()
      
      expect(state.userBalance).toBe(1000)
      expect(state.activeBets).toEqual([])
      expect(state.bettingHistory).toEqual([])
      expect(state.totalWinnings).toBe(0)
      expect(state.totalLosses).toBe(0)
    })
  })

  describe('placeBet', () => {
    it('should successfully place a valid bet', () => {
      const result = placeBet(bettingState, mockContestant.id, 100, 2.5)
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('Bet placed successfully')
      expect(result.newState).toBeDefined()
      expect(result.newState!.userBalance).toBe(900)
      expect(result.newState!.activeBets).toHaveLength(1)
      
      const bet = result.newState!.activeBets[0]
      expect(bet.contestantId).toBe(mockContestant.id)
      expect(bet.amount).toBe(100)
      expect(bet.odds).toBe(2.5)
      expect(bet.potentialPayout).toBe(250)
      expect(bet.status).toBe('active')
    })

    it('should reject bet with negative amount', () => {
      const result = placeBet(bettingState, mockContestant.id, -50, 2.5)
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Bet amount must be positive')
      expect(result.newState).toBeUndefined()
    })

    it('should reject bet with zero amount', () => {
      const result = placeBet(bettingState, mockContestant.id, 0, 2.5)
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Bet amount must be positive')
    })

    it('should reject bet exceeding balance', () => {
      const result = placeBet(bettingState, mockContestant.id, 1500, 2.5)
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Insufficient balance')
    })

    it('should reject bet with invalid odds', () => {
      const result = placeBet(bettingState, mockContestant.id, 100, 0.5)
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid odds')
    })

    it('should reject duplicate bet on same contestant', () => {
      // Place first bet
      const firstResult = placeBet(bettingState, mockContestant.id, 100, 2.5)
      expect(firstResult.success).toBe(true)
      
      // Try to place second bet on same contestant
      const secondResult = placeBet(firstResult.newState!, mockContestant.id, 50, 3.0)
      
      expect(secondResult.success).toBe(false)
      expect(secondResult.message).toBe('You already have a bet on this contestant')
    })
  })

  describe('calculateDynamicOdds', () => {
    it('should calculate odds based on contestant stats', () => {
      const contestants = [mockContestant]
      const updatedContestants = calculateDynamicOdds(contestants, 1, 5)

      expect(updatedContestants).toHaveLength(1)
      expect(updatedContestants[0].currentOdds).toBeGreaterThan(1)
      expect(updatedContestants[0].currentOdds).toBeLessThan(10)
    })

    it('should give better odds to weaker contestants', () => {
      const strongContestant: Contestant = {
        ...mockContestant,
        id: 'strong',
        stats: {
          strength: 10,
          intelligence: 10,
          luck: 10,
          charisma: 10,
          agility: 10,
          deception: 10
        }
      }

      const weakContestant: Contestant = {
        ...mockContestant,
        id: 'weak',
        stats: {
          strength: 1,
          intelligence: 1,
          luck: 1,
          charisma: 1,
          agility: 1,
          deception: 1
        }
      }

      const contestants = [strongContestant, weakContestant]
      const updatedContestants = calculateDynamicOdds(contestants, 1, 5)

      const strongUpdated = updatedContestants.find(c => c.id === strongContestant.id)!
      const weakUpdated = updatedContestants.find(c => c.id === weakContestant.id)!

      expect(weakUpdated.currentOdds).toBeGreaterThan(strongUpdated.currentOdds)
    })
  })
})

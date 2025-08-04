import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useGameStore } from '../stores/gameStore'
import { initializeContestants } from '../data/contestants'
import { GAME_ROUNDS } from '../data/gameRounds'
import type { Contestant, GamePhase } from '../types'

/**
 * End-to-End Test: Complete Game Flow
 * 
 * This test simulates a complete game from start to finish:
 * 1. Initialize game with contestants
 * 2. Start game (intro → betting phase)
 * 3. Place multiple bets on different contestants
 * 4. Begin simulation and run through all rounds
 * 5. Verify game completion and winner declaration
 * 6. Check bet resolution and final balance
 */

describe('E2E: Complete Game Flow - Bet to Finish', () => {
  let initialContestants: Contestant[]
  let gameStore: ReturnType<typeof useGameStore.getState>

  beforeEach(() => {
    // Reset the game store to initial state
    useGameStore.getState().initializeGame()
    gameStore = useGameStore.getState()
    initialContestants = [...gameStore.gameState.contestants]
  })

  it('should complete a full game flow from betting to winner declaration', async () => {
    // ===== PHASE 1: GAME INITIALIZATION =====
    console.log('🎮 Starting E2E Game Flow Test...')
    
    // Verify initial game state
    expect(gameStore.uiState.currentPhase).toBe('intro')
    expect(gameStore.gameState.contestants).toHaveLength(initialContestants.length)
    expect(gameStore.gameState.currentRound).toBe(0)
    expect(gameStore.bettingState.userBalance).toBe(1000)
    expect(gameStore.gameState.contestants.every(c => c.status === 'alive')).toBe(true)

    console.log(`✅ Game initialized with ${initialContestants.length} contestants`)

    // ===== PHASE 2: START GAME (INTRO → BETTING) =====
    gameStore.startGame()
    
    expect(gameStore.uiState.currentPhase).toBe('betting')
    console.log('✅ Transitioned to betting phase')

    // ===== PHASE 3: PLACE STRATEGIC BETS =====
    const aliveContestants = gameStore.getAliveContestants()
    expect(aliveContestants).toHaveLength(initialContestants.length)

    // Place bets on multiple contestants with different strategies
    const bettingTargets = [
      { contestantId: aliveContestants[0].id, amount: 200, strategy: 'high-confidence' },
      { contestantId: aliveContestants[1].id, amount: 150, strategy: 'medium-risk' },
      { contestantId: aliveContestants[2].id, amount: 100, strategy: 'long-shot' }
    ]

    let totalBetAmount = 0
    for (const bet of bettingTargets) {
      const contestant = aliveContestants.find(c => c.id === bet.contestantId)!
      gameStore.placeBet(bet.contestantId, bet.amount)
      totalBetAmount += bet.amount
      
      console.log(`💰 Placed ${bet.amount} bet on ${contestant.name} (${bet.strategy})`)
    }

    // Verify bets were placed correctly
    const currentState = useGameStore.getState()
    expect(currentState.bettingState.activeBets).toHaveLength(3)
    expect(currentState.bettingState.userBalance).toBe(1000 - totalBetAmount)
    
    console.log(`✅ Placed ${bettingTargets.length} bets totaling $${totalBetAmount}`)

    // ===== PHASE 4: BEGIN SIMULATION =====
    gameStore.setGamePhase('simulation')
    expect(gameStore.uiState.currentPhase).toBe('simulation')
    console.log('✅ Entered simulation phase')

    // ===== PHASE 5: SIMULATE ALL ROUNDS UNTIL COMPLETION =====
    let roundCount = 0
    let gameComplete = false
    const maxRounds = GAME_ROUNDS.length + 2 // Safety buffer
    const gameHistory: Array<{
      round: number
      roundName: string
      aliveBefore: number
      aliveAfter: number
      eliminated: string[]
      narrative: string[]
    }> = []

    while (!gameComplete && roundCount < maxRounds) {
      const stateBefore = useGameStore.getState()
      const aliveBeforeRound = stateBefore.getAliveContestants()
      const currentRoundData = stateBefore.gameState.currentRoundData

      if (aliveBeforeRound.length <= 1) {
        gameComplete = true
        break
      }

      console.log(`\n🎲 Round ${roundCount + 1}: ${currentRoundData?.name || 'Unknown'}`)
      console.log(`   Contestants alive: ${aliveBeforeRound.length}`)

      // Simulate the round
      gameStore.simulateNextRound()
      
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      const stateAfter = useGameStore.getState()
      const aliveAfterRound = stateAfter.getAliveContestants()
      const eliminatedThisRound = aliveBeforeRound.filter(
        before => !aliveAfterRound.find(after => after.id === before.id)
      )

      // Record round history
      gameHistory.push({
        round: roundCount + 1,
        roundName: currentRoundData?.name || 'Unknown',
        aliveBefore: aliveBeforeRound.length,
        aliveAfter: aliveAfterRound.length,
        eliminated: eliminatedThisRound.map(c => c.name),
        narrative: stateAfter.gameState.roundNarrative.slice(-3) // Last 3 narrative entries
      })

      console.log(`   Eliminated: ${eliminatedThisRound.map(c => c.name).join(', ') || 'None'}`)
      console.log(`   Survivors: ${aliveAfterRound.length}`)

      // Check if game is complete
      gameComplete = stateAfter.isGameComplete() || aliveAfterRound.length <= 1
      roundCount++

      // Verify round progression
      expect(stateAfter.gameState.currentRound).toBeGreaterThan(stateBefore.gameState.currentRound)
      expect(aliveAfterRound.length).toBeLessThanOrEqual(aliveBeforeRound.length)
    }

    // ===== PHASE 6: VERIFY GAME COMPLETION =====
    const finalState = useGameStore.getState()
    
    expect(gameComplete).toBe(true)
    expect(finalState.isGameComplete()).toBe(true)
    expect(finalState.uiState.currentPhase).toBe('game-over')
    
    const finalAlive = finalState.getAliveContestants()
    const winner = finalState.getWinner()
    
    console.log(`\n🏆 Game completed after ${roundCount} rounds`)
    console.log(`   Final survivors: ${finalAlive.length}`)
    console.log(`   Winner: ${winner?.name || 'None declared'}`)

    // Verify winner conditions
    if (finalAlive.length === 1) {
      expect(winner).toBeDefined()
      expect(winner!.status).toBe('winner')
      expect(finalAlive[0].id).toBe(winner!.id)
      console.log(`✅ Winner correctly declared: ${winner!.name}`)
    } else if (finalAlive.length === 0) {
      console.log('⚠️  No survivors - all contestants eliminated')
    }

    // ===== PHASE 7: VERIFY BET RESOLUTION =====
    const finalBettingState = finalState.bettingState
    
    // Check that bets have been resolved
    const resolvedBets = finalBettingState.bettingHistory.filter(bet => 
      bet.status === 'won' || bet.status === 'lost'
    )
    
    console.log(`\n💰 Bet Resolution:`)
    console.log(`   Active bets: ${finalBettingState.activeBets.length}`)
    console.log(`   Resolved bets: ${resolvedBets.length}`)
    console.log(`   Final balance: $${finalBettingState.userBalance}`)
    console.log(`   Total winnings: $${finalBettingState.totalWinnings}`)
    console.log(`   Total losses: $${finalBettingState.totalLosses}`)

    // Verify betting state consistency
    expect(finalBettingState.userBalance).toBeGreaterThanOrEqual(0)
    expect(finalBettingState.totalWinnings).toBeGreaterThanOrEqual(0)
    expect(finalBettingState.totalLosses).toBeGreaterThanOrEqual(0)

    // ===== PHASE 8: VERIFY GAME HISTORY AND DATA INTEGRITY =====
    
    // Check that all contestants are accounted for
    const allContestants = [
      ...finalState.gameState.contestants,
      ...finalState.gameState.eliminatedContestants
    ]
    const uniqueContestantIds = new Set(allContestants.map(c => c.id))
    expect(uniqueContestantIds.size).toBe(initialContestants.length)

    // Verify game progression made sense
    expect(gameHistory.length).toBeGreaterThan(0)
    expect(gameHistory.length).toBeLessThanOrEqual(GAME_ROUNDS.length)

    // Check that eliminations happened progressively
    for (let i = 1; i < gameHistory.length; i++) {
      expect(gameHistory[i].aliveAfter).toBeLessThanOrEqual(gameHistory[i-1].aliveAfter)
    }

    // ===== FINAL SUMMARY =====
    console.log(`\n📊 Game Summary:`)
    console.log(`   Total rounds played: ${gameHistory.length}`)
    console.log(`   Initial contestants: ${initialContestants.length}`)
    console.log(`   Final survivors: ${finalAlive.length}`)
    console.log(`   Total eliminations: ${initialContestants.length - finalAlive.length}`)
    console.log(`   Winner: ${winner?.name || 'None'}`)
    console.log(`   Net betting result: $${finalBettingState.userBalance - (1000 - totalBetAmount)}`)

    // Print round-by-round summary
    console.log(`\n📋 Round History:`)
    gameHistory.forEach(round => {
      console.log(`   Round ${round.round} (${round.roundName}): ${round.aliveBefore} → ${round.aliveAfter} alive`)
    })

    console.log('\n🎉 E2E Test completed successfully!')
  }, 30000) // 30 second timeout for complete game simulation

  it('should handle edge case where all contestants are eliminated', async () => {
    // This test simulates a scenario where the game might eliminate all contestants
    gameStore.startGame()
    gameStore.placeBet(initialContestants[0].id, 100)
    gameStore.setGamePhase('simulation')

    // Force elimination of all contestants by running many rounds
    let attempts = 0
    const maxAttempts = 20

    while (gameStore.getAliveContestants().length > 0 && attempts < maxAttempts) {
      gameStore.simulateNextRound()
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    }

    const finalState = useGameStore.getState()
    
    // Game should handle this gracefully
    expect(finalState.isGameComplete()).toBe(true)
    expect(finalState.uiState.currentPhase).toBe('game-over')
    
    console.log('✅ Edge case handled: All contestants eliminated')
  })

  it('should maintain data consistency throughout the game', async () => {
    gameStore.startGame()
    
    // Place bets on all contestants
    const allContestants = gameStore.getAliveContestants()
    allContestants.forEach((contestant, index) => {
      if (index < 5) { // Limit to 5 bets to avoid balance issues
        gameStore.placeBet(contestant.id, 50)
      }
    })

    gameStore.setGamePhase('simulation')

    // Run several rounds and check consistency
    for (let i = 0; i < 3; i++) {
      const stateBefore = useGameStore.getState()
      const aliveCountBefore = stateBefore.getAliveContestants().length
      
      if (aliveCountBefore <= 1) break

      gameStore.simulateNextRound()
      await new Promise(resolve => setTimeout(resolve, 50))

      const stateAfter = useGameStore.getState()
      const aliveCountAfter = stateAfter.getAliveContestants().length

      // Verify data consistency
      expect(stateAfter.gameState.currentRound).toBeGreaterThan(stateBefore.gameState.currentRound)
      expect(aliveCountAfter).toBeLessThanOrEqual(aliveCountBefore)
      expect(stateAfter.gameState.roundNarrative.length).toBeGreaterThan(stateBefore.gameState.roundNarrative.length)
    }

    console.log('✅ Data consistency maintained throughout simulation')
  })
})

describe('E2E: UI Component Integration Flow', () => {
  beforeEach(() => {
    useGameStore.getState().initializeGame()
  })

  it('should handle complete UI flow with user interactions', async () => {
    const gameStore = useGameStore.getState()

    // ===== INTRO PHASE =====
    expect(gameStore.uiState.currentPhase).toBe('intro')

    // Simulate user viewing contestant details
    const firstContestant = gameStore.gameState.contestants[0]
    gameStore.selectContestant(firstContestant.id)

    expect(gameStore.uiState.selectedContestant).toBe(firstContestant.id)
    expect(gameStore.uiState.showContestantDetails).toBe(true)

    // Close details
    gameStore.toggleContestantDetails()
    expect(gameStore.uiState.showContestantDetails).toBe(false)

    console.log('✅ Intro phase interactions working')

    // ===== BETTING PHASE =====
    gameStore.startGame()
    expect(gameStore.uiState.currentPhase).toBe('betting')

    // Simulate user placing bets with different amounts
    const bettingScenarios = [
      { amount: 250, expectedSuccess: true },
      { amount: 1000, expectedSuccess: false }, // Should fail - insufficient balance
      { amount: 100, expectedSuccess: true }
    ]

    let successfulBets = 0
    for (const scenario of bettingScenarios) {
      const balanceBefore = useGameStore.getState().bettingState.userBalance
      const contestant = gameStore.getAliveContestants()[successfulBets]

      gameStore.placeBet(contestant.id, scenario.amount)

      const balanceAfter = useGameStore.getState().bettingState.userBalance

      if (scenario.expectedSuccess) {
        expect(balanceAfter).toBe(balanceBefore - scenario.amount)
        successfulBets++
      } else {
        expect(balanceAfter).toBe(balanceBefore) // Balance unchanged
      }
    }

    console.log(`✅ Betting interactions: ${successfulBets} successful bets placed`)

    // ===== SIMULATION PHASE =====
    gameStore.setGamePhase('simulation')
    expect(gameStore.uiState.currentPhase).toBe('simulation')

    // Test simulation speed changes
    const speeds: Array<'slow' | 'normal' | 'fast'> = ['fast', 'slow', 'normal']
    for (const speed of speeds) {
      gameStore.setSimulationSpeed(speed)
      expect(useGameStore.getState().uiState.simulationSpeed).toBe(speed)
    }

    // Run a few rounds
    for (let i = 0; i < 2; i++) {
      if (gameStore.getAliveContestants().length > 1) {
        gameStore.simulateNextRound()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log('✅ Simulation phase interactions working')

    // ===== VERIFY FINAL STATE =====
    const finalState = useGameStore.getState()
    expect(finalState.gameState.currentRound).toBeGreaterThan(0)
    expect(finalState.gameState.roundNarrative.length).toBeGreaterThan(0)

    console.log('✅ UI component integration test completed')
  })
})

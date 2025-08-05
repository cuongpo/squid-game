// Simple test to verify game functionality
import { initializeContestants } from '../data/contestants';
import { GAME_ROUNDS } from '../data/gameRounds';
import { simulateRound } from './gameEngine';
import { initializeBettingState, placeBet } from './bettingSystem';

export function runGameTest() {
  console.log('🎮 Starting Squid Game Simulator Test...');
  
  // Initialize contestants
  const contestants = initializeContestants();
  console.log(`✅ Initialized ${contestants.length} contestants`);
  
  // Initialize betting
  const bettingState = initializeBettingState();
  console.log(`💰 Starting balance: $${bettingState.userBalance}`);
  
  // Place a test bet
  const testContestant = contestants[0];
  const betResult = placeBet(bettingState, testContestant.id, 100, testContestant.currentOdds);
  console.log(`🎯 Bet placed: ${betResult.success ? 'Success' : 'Failed'} - ${betResult.message}`);
  
  // Simulate first round
  const firstRound = GAME_ROUNDS[0];
  console.log(`🎲 Simulating ${firstRound.name}...`);
  
  const roundResult = simulateRound(contestants, firstRound, 1);
  console.log(`⚰️  Eliminated: ${roundResult.eliminated.length} contestants`);
  console.log(`✅ Survivors: ${roundResult.survivors.length} contestants`);
  
  // Show some narrative
  console.log('📖 Game narrative:');
  roundResult.narrative.forEach(line => console.log(`   ${line}`));
  
  console.log('🎉 Test completed successfully!');
  
  return {
    contestants: roundResult.survivors,
    eliminated: roundResult.eliminated,
    narrative: roundResult.narrative,
    bettingState: betResult.newState || bettingState
  };
}

// Simple test for debugging the elimination issue
export function testFirstRound() {
  console.log('🧪 Testing first round elimination logic...');

  const contestants = initializeContestants();
  const firstRound = GAME_ROUNDS[0];

  console.log('Initial contestants:', contestants.map(c => `${c.name} (${c.status})`));

  const roundResult = simulateRound(contestants, firstRound, 1);

  console.log('Round result:');
  console.log('  Survivors:', roundResult.survivors.map(s => s.name));
  console.log('  Eliminated:', roundResult.eliminated.map(e => e.name));

  return roundResult;
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testGame = runGameTest;
  (window as any).testFirstRound = testFirstRound;
  console.log('🎮 Squid Game Simulator loaded! Type "testGame()" or "testFirstRound()" in console to run tests.');
}

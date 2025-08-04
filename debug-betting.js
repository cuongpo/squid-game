// Quick debug script for betting system
import { initializeBettingState, placeBet } from './src/utils/bettingSystem.js';

const bettingState = initializeBettingState();
console.log('Initial betting state:', bettingState);

const result = placeBet(bettingState, 'player1', 100, 2.5);
console.log('Bet result:', result);

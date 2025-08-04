#!/usr/bin/env node

/**
 * End-to-End Test Runner for Squid Game Simulator
 * 
 * This script runs the comprehensive E2E tests that simulate
 * a complete game flow from betting to finish.
 */

import { spawn } from 'child_process';

console.log('🎮 Running End-to-End Tests for Squid Game Simulator');
console.log('📋 This will test the complete game flow from betting to finish\n');

const vitestArgs = [
  'vitest',
  'run',
  '--reporter=verbose',
  'src/__tests__/e2e-complete-game-flow.test.ts'
];

const child = spawn('npx', vitestArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n🎉 End-to-End tests completed successfully!');
    console.log('✅ Your Squid Game Simulator is working correctly from start to finish.');
  } else {
    console.log(`\n❌ End-to-End tests failed with exit code ${code}`);
    console.log('🔧 Check the output above for details on what needs to be fixed.');
  }
  process.exit(code);
});

child.on('error', (error) => {
  console.error(`Error running E2E tests: ${error.message}`);
  process.exit(1);
});

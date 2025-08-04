#!/usr/bin/env node

/**
 * Simple test runner script for Squid Game Simulator
 * Usage: node run-tests.js [category]
 * 
 * Categories:
 * - utils: Run utility function tests
 * - components: Run React component tests
 * - integration: Run integration tests
 * - all: Run all tests (default)
 */

const { spawn } = require('child_process');
const path = require('path');

const category = process.argv[2] || 'all';

const testPatterns = {
  utils: 'src/utils/**/*.test.{ts,tsx}',
  components: 'src/components/**/*.test.{ts,tsx}',
  integration: 'src/__tests__/integration.test.ts',
  store: 'src/stores/**/*.test.{ts,tsx}',
  app: 'src/__tests__/App.test.tsx',
  all: 'src/**/*.{test,spec}.{ts,tsx}'
};

const pattern = testPatterns[category];

if (!pattern) {
  console.error(`Unknown test category: ${category}`);
  console.error(`Available categories: ${Object.keys(testPatterns).join(', ')}`);
  process.exit(1);
}

console.log(`🧪 Running ${category} tests...`);
console.log(`📁 Pattern: ${pattern}\n`);

const vitestArgs = [
  'vitest',
  'run',
  '--reporter=verbose',
  pattern
];

const child = spawn('npx', vitestArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ ${category} tests completed successfully!`);
  } else {
    console.log(`\n❌ ${category} tests failed with exit code ${code}`);
  }
  process.exit(code);
});

child.on('error', (error) => {
  console.error(`Error running tests: ${error.message}`);
  process.exit(1);
});

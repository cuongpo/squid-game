#!/usr/bin/env node

/**
 * Manual End-to-End Test Guide for Blockchain Integration
 * 
 * This script provides a step-by-step manual testing guide
 * for the complete Squid Game blockchain flow.
 */

const fs = require('fs');

// Load deployment info
let deploymentInfo = {};
try {
  deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
} catch (error) {
  console.error('❌ Could not load deployment info');
}

console.log('🎮 SQUID GAME BLOCKCHAIN - MANUAL E2E TEST GUIDE');
console.log('='.repeat(60));

const testSteps = [
  {
    phase: '🔌 Phase 1: Wallet Connection',
    description: 'Connect MetaMask to Avalanche testnet',
    steps: [
      'Open http://localhost:5173/ in your browser',
      'Ensure MetaMask is installed and unlocked',
      'Click "Connect Wallet" button in the header',
      'Approve the connection in MetaMask popup',
      'If prompted, switch to Avalanche testnet (Chain ID: 43113)',
      'Verify wallet address and AVAX balance are displayed',
      'Confirm "Wallet Connected" status shows green'
    ],
    expectedResults: [
      '✅ Wallet shows as connected',
      '✅ AVAX balance is displayed (should be > 0.1 AVAX)',
      '✅ Network shows "Avalanche Testnet"',
      '✅ No error messages in console'
    ],
    troubleshooting: [
      'If MetaMask not detected: Install MetaMask extension',
      'If wrong network: Click "Switch Network" or add Avalanche testnet manually',
      'If no balance: Get AVAX from https://faucet.avax.network/'
    ]
  },
  {
    phase: '🎮 Phase 2: Game Setup',
    description: 'Initialize game and enable blockchain betting',
    steps: [
      'Click "Enter the Games" from the intro screen',
      'Verify 456 contestants are loaded in betting screen',
      'Look for "Betting Mode" toggle in the interface',
      'Click to enable "Blockchain (AVAX)" mode',
      'Verify your AVAX balance is shown instead of $ balance',
      'Confirm blockchain betting info panel appears'
    ],
    expectedResults: [
      '✅ 456 contestants displayed with odds',
      '✅ Betting mode shows "Blockchain (AVAX)"',
      '✅ AVAX balance displayed correctly',
      '✅ Blockchain betting info panel visible'
    ],
    troubleshooting: [
      'If contestants not loading: Check console for errors',
      'If blockchain mode not available: Verify wallet connection',
      'If balance not updating: Refresh wallet connection'
    ]
  },
  {
    phase: '⛓️ Phase 3: Blockchain Game Creation',
    description: 'Create game onchain and enable narrative logging',
    steps: [
      'Click "Start the Games" button',
      'MetaMask should popup requesting game creation transaction',
      'Review transaction details (gas fee should be reasonable)',
      'Confirm the transaction in MetaMask',
      'Wait for transaction confirmation (1-3 seconds)',
      'Verify game ID appears in blockchain status',
      'Check that narrative logging is enabled'
    ],
    expectedResults: [
      '✅ Transaction confirmed in MetaMask',
      '✅ Game ID generated and displayed',
      '✅ Transaction notification appears',
      '✅ Blockchain game status shows active game'
    ],
    troubleshooting: [
      'If transaction fails: Check AVAX balance for gas',
      'If no popup: Ensure MetaMask is unlocked',
      'If high gas: Wait for network congestion to clear'
    ]
  },
  {
    phase: '💰 Phase 4: AVAX Betting',
    description: 'Place real AVAX bets on contestants',
    steps: [
      'Select a contestant with good odds (2x-4x)',
      'Click on the contestant card to open betting modal',
      'Enter bet amount (try 0.05 AVAX)',
      'Review potential payout calculation',
      'Click "Place Bet" button',
      'Confirm transaction in MetaMask popup',
      'Wait for bet confirmation',
      'Repeat for 2-3 different contestants',
      'Verify bets appear in "Your Active Bets" section'
    ],
    expectedResults: [
      '✅ Betting modal opens correctly',
      '✅ Payout calculation is accurate',
      '✅ Transactions confirm successfully',
      '✅ Bets appear in blockchain betting info',
      '✅ AVAX balance decreases by bet amounts + gas'
    ],
    troubleshooting: [
      'If insufficient funds: Reduce bet amount or get more AVAX',
      'If transaction pending: Wait longer or increase gas price',
      'If bet not appearing: Check transaction status'
    ]
  },
  {
    phase: '🎬 Phase 5: Game Simulation',
    description: 'Run game simulation with onchain narrative logging',
    steps: [
      'After placing bets, click "Start the Games"',
      'Watch the game simulation begin',
      'Observe round narratives being generated',
      'Check for transaction notifications for narrative logging',
      'Watch contestants get eliminated each round',
      'Continue through all 5 rounds or until winner emerges',
      'Verify narratives are being stored onchain'
    ],
    expectedResults: [
      '✅ Game simulation runs smoothly',
      '✅ AI narratives are generated for each round',
      '✅ Transaction notifications for narrative storage',
      '✅ Eliminations are animated and tracked',
      '✅ Game progresses to completion'
    ],
    troubleshooting: [
      'If simulation stalls: Check console for errors',
      'If narratives not logging: Verify gas balance',
      'If performance issues: Close other browser tabs'
    ]
  },
  {
    phase: '🏆 Phase 6: Game Completion & Payouts',
    description: 'Complete game and receive automatic payouts',
    steps: [
      'Wait for game to complete (winner declared)',
      'Move to results screen',
      'Check blockchain game status panel',
      'Verify winner is declared onchain',
      'Check if any of your bets won',
      'Wait for automatic payout transactions',
      'Verify final AVAX balance',
      'Review complete transaction history'
    ],
    expectedResults: [
      '✅ Winner declared and shown',
      '✅ Blockchain status shows game completed',
      '✅ Winning bets receive automatic payouts',
      '✅ Final balance reflects winnings/losses',
      '✅ All transactions visible in notifications'
    ],
    troubleshooting: [
      'If payouts delayed: Wait for blockchain confirmation',
      'If balance incorrect: Check all transaction statuses',
      'If game not ending: Verify all rounds completed'
    ]
  },
  {
    phase: '🔍 Phase 7: Blockchain Verification',
    description: 'Verify all data on Avalanche explorer',
    steps: [
      'Copy transaction hashes from notifications',
      'Visit https://testnet.snowtrace.io/',
      'Search for your transaction hashes',
      'Verify contract interactions and events',
      'Check game contract for your game data',
      'Verify narrative contract for stored stories',
      'Confirm all bet transactions and payouts'
    ],
    expectedResults: [
      '✅ All transactions visible on explorer',
      '✅ Contract events show game creation, bets, results',
      '✅ Narrative data stored in contract logs',
      '✅ Bet payouts recorded onchain'
    ],
    troubleshooting: [
      'If transactions not found: Wait for indexing',
      'If data missing: Check transaction was confirmed',
      'If explorer slow: Try refreshing or wait'
    ]
  }
];

function printTestGuide() {
  console.log('\n📋 STEP-BY-STEP TEST GUIDE\n');
  
  testSteps.forEach((phase, index) => {
    console.log(`${index + 1}. ${phase.phase}`);
    console.log(`   ${phase.description}`);
    console.log('   ' + '-'.repeat(50));
    
    console.log('\n   📝 Steps to perform:');
    phase.steps.forEach((step, stepIndex) => {
      console.log(`   ${stepIndex + 1}. ${step}`);
    });
    
    console.log('\n   ✅ Expected results:');
    phase.expectedResults.forEach(result => {
      console.log(`   ${result}`);
    });
    
    console.log('\n   🔧 Troubleshooting:');
    phase.troubleshooting.forEach(tip => {
      console.log(`   • ${tip}`);
    });
    
    console.log('\n');
  });
}

function printContractInfo() {
  console.log('🏗️ CONTRACT INFORMATION\n');
  
  if (deploymentInfo.contracts) {
    console.log(`Game Contract: ${deploymentInfo.contracts.SquidGameContract}`);
    console.log(`Narrative Contract: ${deploymentInfo.contracts.NarrativeContract}`);
    console.log(`Deployed by: ${deploymentInfo.deployer}`);
    console.log(`Deployed at: ${deploymentInfo.deployedAt}`);
    console.log('');
    console.log('🔗 Explorer Links:');
    console.log(`Game: ${deploymentInfo.explorerUrls?.SquidGameContract || 'N/A'}`);
    console.log(`Narrative: ${deploymentInfo.explorerUrls?.NarrativeContract || 'N/A'}`);
  } else {
    console.log('❌ No deployment info found. Run deployment first.');
  }
  console.log('');
}

function printQuickChecklist() {
  console.log('⚡ QUICK CHECKLIST\n');
  console.log('Before starting the test, ensure:');
  console.log('□ MetaMask is installed and unlocked');
  console.log('□ Wallet has at least 0.2 AVAX for testing');
  console.log('□ Application is running (npm run dev)');
  console.log('□ Browser is connected to http://localhost:5173/');
  console.log('□ No other blockchain apps are interfering');
  console.log('');
}

function printSuccessCriteria() {
  console.log('🎯 SUCCESS CRITERIA\n');
  console.log('The test is successful if:');
  console.log('✅ Wallet connects to Avalanche testnet');
  console.log('✅ Game is created onchain with valid transaction');
  console.log('✅ AVAX bets are placed and confirmed');
  console.log('✅ Game simulation runs with narrative logging');
  console.log('✅ Winner is declared and results stored onchain');
  console.log('✅ Automatic payouts are processed');
  console.log('✅ All transactions are verifiable on Snowtrace');
  console.log('');
  console.log('🏆 If all criteria are met, your blockchain integration is WORKING!');
  console.log('');
}

// Main execution
printContractInfo();
printQuickChecklist();
printTestGuide();
printSuccessCriteria();

console.log('📚 ADDITIONAL RESOURCES\n');
console.log('• Avalanche Testnet Faucet: https://faucet.avax.network/');
console.log('• Snowtrace Explorer: https://testnet.snowtrace.io/');
console.log('• MetaMask Setup Guide: https://docs.metamask.io/');
console.log('• Troubleshooting: Check browser console for errors');
console.log('');
console.log('🚀 Ready to test? Start with Phase 1 and work through each step!');

module.exports = { testSteps, printTestGuide };

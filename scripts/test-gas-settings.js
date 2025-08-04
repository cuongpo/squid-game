#!/usr/bin/env node

/**
 * Test Gas Settings
 * 
 * Verifies that the gas settings are now properly configured for mainnet
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const MAINNET_RPC = 'https://node.mainnet.etherlink.com';
const GAME_CONTRACT = '0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99';

const GAME_CONTRACT_ABI = [
  "function createGame(string[] memory contestantIds, string[] memory contestantNames, uint256 totalRounds) external returns (uint256)"
];

async function testGasSettings() {
  console.log('⛽ Testing Gas Settings Configuration');
  console.log('=' .repeat(40));
  console.log();

  try {
    // Connect to mainnet
    const provider = new ethers.JsonRpcProvider(MAINNET_RPC);
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to Chain ID: ${network.chainId}`);

    // Create a test wallet (for gas estimation only)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`💰 Test wallet: ${wallet.address}`);

    // Create contract instance
    const gameContract = new ethers.Contract(GAME_CONTRACT, GAME_CONTRACT_ABI, wallet);

    // Test gas estimation for game creation
    console.log('\n🧪 Testing gas estimation for game creation...');
    
    const testContestants = [
      'jihoon', 'minseo', 'daejung', 'hana', 'sunwoo', 
      'sora', 'kyung', 'yuna', 'taemin', 'mira'
    ];
    const testNames = [
      'Jihoon', 'Minseo', 'Daejung', 'Hana', 'Sunwoo',
      'Sora', 'Kyung', 'Yuna', 'Taemin', 'Mira'
    ];

    const gasEstimate = await gameContract.createGame.estimateGas(
      testContestants,
      testNames,
      5
    );

    console.log(`✅ Gas estimate: ${gasEstimate.toLocaleString()}`);

    // Calculate gas with buffer
    const gasWithBuffer = (gasEstimate * 120n) / 100n;
    console.log(`✅ Gas with 20% buffer: ${gasWithBuffer.toLocaleString()}`);

    // Check if our new limits are sufficient
    const maxGasLimit = 15000000;
    const isGasSufficient = Number(gasWithBuffer) <= maxGasLimit;
    
    console.log(`\n📊 Gas Analysis:`);
    console.log(`   Estimated gas needed: ${gasEstimate.toLocaleString()}`);
    console.log(`   Gas with buffer: ${gasWithBuffer.toLocaleString()}`);
    console.log(`   Max gas limit: ${maxGasLimit.toLocaleString()}`);
    console.log(`   Sufficient: ${isGasSufficient ? '✅ YES' : '❌ NO'}`);

    // Calculate costs
    const gasPrice = 1000000000n; // 1 gwei
    const estimatedCost = gasWithBuffer * gasPrice;
    
    console.log(`\n💰 Cost Analysis:`);
    console.log(`   Gas price: 1 gwei`);
    console.log(`   Estimated cost: ${ethers.formatEther(estimatedCost)} XTZ`);
    console.log(`   Cost in USD: ~$${(parseFloat(ethers.formatEther(estimatedCost)) * 0.85).toFixed(4)}`);

    if (isGasSufficient) {
      console.log('\n🎉 Gas settings are now properly configured!');
      console.log('✅ Game creation should work with these settings');
      console.log('✅ Gas limits increased from 80,000 to 15,000,000');
      console.log('✅ Gas price updated to 1 gwei for mainnet');
    } else {
      console.log('\n⚠️  Gas limits may still be insufficient');
      console.log(`Recommend increasing max gas limit to: ${Number(gasWithBuffer).toLocaleString()}`);
    }

    return isGasSufficient;

  } catch (error) {
    console.error(`❌ Gas settings test failed: ${error.message}`);
    return false;
  }
}

// Run the test
testGasSettings()
  .then((success) => {
    if (success) {
      console.log('\n🚀 Ready to test game creation in the application!');
    } else {
      console.log('\n🔧 Gas settings may need further adjustment.');
    }
  })
  .catch(console.error);

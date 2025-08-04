/**
 * Test Mainnet Configuration
 * 
 * This utility helps verify that the mainnet configuration is working correctly
 */

import { CURRENT_NETWORK, CURRENT_CONTRACTS } from '../config/blockchain';

export function testMainnetConfig() {
  console.log('🔧 Testing Mainnet Configuration...');
  console.log('=' .repeat(40));
  
  // Check environment
  const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
  console.log(`Environment: ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
  console.log(`VITE_NETWORK: ${import.meta.env.VITE_NETWORK}`);
  
  // Check network config
  console.log('\n🌐 Network Configuration:');
  console.log(`Chain ID: ${CURRENT_NETWORK.chainId}`);
  console.log(`Chain Name: ${CURRENT_NETWORK.chainName}`);
  console.log(`RPC URL: ${CURRENT_NETWORK.rpcUrls[0]}`);
  console.log(`Explorer: ${CURRENT_NETWORK.blockExplorerUrls[0]}`);
  
  // Check contract addresses
  console.log('\n📋 Contract Addresses:');
  console.log(`Game Contract: ${CURRENT_CONTRACTS.GAME_CONTRACT || 'NOT SET'}`);
  console.log(`Narrative Contract: ${CURRENT_CONTRACTS.NARRATIVE_CONTRACT || 'NOT SET'}`);
  console.log(`Betting Contract: ${CURRENT_CONTRACTS.BETTING_CONTRACT || 'NOT SET'}`);
  
  // Validation
  const isValid = CURRENT_CONTRACTS.GAME_CONTRACT && 
                  CURRENT_CONTRACTS.NARRATIVE_CONTRACT && 
                  (isMainnet ? CURRENT_NETWORK.chainId === 42793 : CURRENT_NETWORK.chainId === 128123);
  
  console.log(`\n✅ Configuration Status: ${isValid ? 'VALID' : 'INVALID'}`);
  
  if (isMainnet && isValid) {
    console.log('\n🎉 MAINNET MODE ACTIVE!');
    console.log('🔗 Using live contracts on Etherlink Mainnet');
    console.log('💰 Real XTZ transactions enabled');
  } else if (!isMainnet && isValid) {
    console.log('\n🧪 TESTNET MODE ACTIVE');
    console.log('🔗 Using test contracts on Etherlink Testnet');
    console.log('💰 Test XTZ transactions enabled');
  } else {
    console.log('\n⚠️  CONFIGURATION ISSUE DETECTED');
    console.log('Please check your environment variables and contract addresses');
  }
  
  return {
    isMainnet,
    isValid,
    network: CURRENT_NETWORK,
    contracts: CURRENT_CONTRACTS
  };
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testMainnetConfig();
}

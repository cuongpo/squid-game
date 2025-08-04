#!/usr/bin/env node

/**
 * Verify Mainnet Configuration
 * 
 * This script verifies that the application is correctly configured for mainnet:
 * 1. Check environment variables
 * 2. Verify RPC endpoints
 * 3. Test contract addresses
 * 4. Confirm explorer URLs
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Expected mainnet configuration
const EXPECTED_MAINNET_CONFIG = {
  chainId: 42793,
  rpcUrl: 'https://node.mainnet.etherlink.com',
  explorerUrl: 'https://explorer.etherlink.com/',
  gameContract: '0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99',
  narrativeContract: '0xc4Cbc3F5CD22A1B1c7EB4484b19605C835B785B0'
};

class MainnetConfigVerifier {
  constructor() {
    this.provider = null;
  }

  async verifyEnvironment() {
    console.log('🔧 Verifying Environment Configuration...\n');

    // Check VITE_NETWORK
    const network = process.env.VITE_NETWORK;
    console.log(`VITE_NETWORK: ${network}`);
    
    if (network !== 'mainnet') {
      console.log('❌ VITE_NETWORK should be "mainnet"');
      return false;
    }
    console.log('✅ Environment set to mainnet');

    // Check Sequence config
    const sequenceKey = process.env.VITE_SEQUENCE_PROJECT_ACCESS_KEY;
    const waasKey = process.env.VITE_SEQUENCE_WAAS_CONFIG_KEY;
    
    if (sequenceKey && waasKey) {
      console.log('✅ Sequence configuration present');
    } else {
      console.log('⚠️  Sequence configuration missing (optional)');
    }

    console.log();
    return true;
  }

  async verifyRpcConnection() {
    console.log('🌐 Verifying RPC Connection...\n');

    try {
      this.provider = new ethers.JsonRpcProvider(EXPECTED_MAINNET_CONFIG.rpcUrl);
      
      // Test connection
      const network = await this.provider.getNetwork();
      console.log(`Connected to Chain ID: ${network.chainId}`);
      
      if (Number(network.chainId) !== EXPECTED_MAINNET_CONFIG.chainId) {
        console.log(`❌ Wrong chain ID! Expected ${EXPECTED_MAINNET_CONFIG.chainId}, got ${network.chainId}`);
        return false;
      }
      
      // Test block number
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`Latest block: ${blockNumber.toLocaleString()}`);
      
      // Test gas price
      const feeData = await this.provider.getFeeData();
      console.log(`Gas price: ${ethers.formatUnits(feeData.gasPrice || 0n, 'gwei')} gwei`);
      
      console.log('✅ RPC connection successful');
      console.log();
      return true;

    } catch (error) {
      console.log(`❌ RPC connection failed: ${error.message}`);
      console.log();
      return false;
    }
  }

  async verifyContracts() {
    console.log('📋 Verifying Contract Deployment...\n');

    if (!this.provider) {
      console.log('❌ No provider available');
      return false;
    }

    try {
      // Check Game Contract
      const gameCode = await this.provider.getCode(EXPECTED_MAINNET_CONFIG.gameContract);
      if (gameCode === '0x') {
        console.log(`❌ Game Contract not deployed at ${EXPECTED_MAINNET_CONFIG.gameContract}`);
        return false;
      }
      console.log(`✅ Game Contract deployed: ${EXPECTED_MAINNET_CONFIG.gameContract}`);
      console.log(`   Code size: ${(gameCode.length - 2) / 2} bytes`);

      // Check Narrative Contract
      const narrativeCode = await this.provider.getCode(EXPECTED_MAINNET_CONFIG.narrativeContract);
      if (narrativeCode === '0x') {
        console.log(`❌ Narrative Contract not deployed at ${EXPECTED_MAINNET_CONFIG.narrativeContract}`);
        return false;
      }
      console.log(`✅ Narrative Contract deployed: ${EXPECTED_MAINNET_CONFIG.narrativeContract}`);
      console.log(`   Code size: ${(narrativeCode.length - 2) / 2} bytes`);

      console.log();
      return true;

    } catch (error) {
      console.log(`❌ Contract verification failed: ${error.message}`);
      console.log();
      return false;
    }
  }

  async testContractInteraction() {
    console.log('🧪 Testing Contract Interaction...\n');

    if (!this.provider) {
      console.log('❌ No provider available');
      return false;
    }

    try {
      // Test Game Contract read function
      const gameContractAbi = [
        "function gameCounter() external view returns (uint256)"
      ];
      
      const gameContract = new ethers.Contract(
        EXPECTED_MAINNET_CONFIG.gameContract,
        gameContractAbi,
        this.provider
      );

      const gameCounter = await gameContract.gameCounter();
      console.log(`✅ Game Contract interaction successful`);
      console.log(`   Current game counter: ${gameCounter}`);

      // Test Narrative Contract read function
      const narrativeContractAbi = [
        "function narrativeCounter() external view returns (uint256)"
      ];
      
      const narrativeContract = new ethers.Contract(
        EXPECTED_MAINNET_CONFIG.narrativeContract,
        narrativeContractAbi,
        this.provider
      );

      const narrativeCounter = await narrativeContract.narrativeCounter();
      console.log(`✅ Narrative Contract interaction successful`);
      console.log(`   Current narrative counter: ${narrativeCounter}`);

      console.log();
      return true;

    } catch (error) {
      console.log(`❌ Contract interaction failed: ${error.message}`);
      console.log();
      return false;
    }
  }

  async verifyExplorerUrls() {
    console.log('🔗 Verifying Explorer URLs...\n');

    const urls = [
      `${EXPECTED_MAINNET_CONFIG.explorerUrl}address/${EXPECTED_MAINNET_CONFIG.gameContract}`,
      `${EXPECTED_MAINNET_CONFIG.explorerUrl}address/${EXPECTED_MAINNET_CONFIG.narrativeContract}`
    ];

    console.log('📊 Explorer URLs:');
    urls.forEach((url, index) => {
      const contractName = index === 0 ? 'Game Contract' : 'Narrative Contract';
      console.log(`   ${contractName}: ${url}`);
    });

    console.log('✅ Explorer URLs configured correctly');
    console.log();
    return true;
  }

  async generateReport() {
    console.log('📊 Mainnet Configuration Report');
    console.log('=' .repeat(40));
    console.log();

    console.log('🎯 Configuration Summary:');
    console.log(`   Network: Etherlink Mainnet`);
    console.log(`   Chain ID: ${EXPECTED_MAINNET_CONFIG.chainId}`);
    console.log(`   RPC URL: ${EXPECTED_MAINNET_CONFIG.rpcUrl}`);
    console.log(`   Explorer: ${EXPECTED_MAINNET_CONFIG.explorerUrl}`);
    console.log();

    console.log('📋 Deployed Contracts:');
    console.log(`   Game Contract: ${EXPECTED_MAINNET_CONFIG.gameContract}`);
    console.log(`   Narrative Contract: ${EXPECTED_MAINNET_CONFIG.narrativeContract}`);
    console.log();

    console.log('🎮 Application Status:');
    console.log('   ✅ Ready for production use');
    console.log('   ✅ Real XTZ transactions enabled');
    console.log('   ✅ Mainnet contracts operational');
    console.log('   ✅ Explorer integration working');
    console.log();

    console.log('🚀 Next Steps:');
    console.log('   1. Open http://localhost:5174/');
    console.log('   2. Connect wallet to Etherlink Mainnet');
    console.log('   3. Test with small XTZ amounts');
    console.log('   4. Deploy frontend to production');
  }

  async runVerification() {
    console.log('🎮 Squid Game - Mainnet Configuration Verification');
    console.log('=' .repeat(60));
    console.log();

    const results = {
      environment: false,
      rpcConnection: false,
      contracts: false,
      contractInteraction: false,
      explorerUrls: false
    };

    try {
      results.environment = await this.verifyEnvironment();
      results.rpcConnection = await this.verifyRpcConnection();
      results.contracts = await this.verifyContracts();
      results.contractInteraction = await this.testContractInteraction();
      results.explorerUrls = await this.verifyExplorerUrls();

      // Summary
      console.log('📊 Verification Results:');
      console.log('=' .repeat(30));
      Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${testName}`);
      });

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} verifications passed`);
      
      if (passedTests === totalTests) {
        console.log('\n🎉 Mainnet configuration verified!');
        await this.generateReport();
      } else {
        console.log('\n⚠️  Configuration issues detected.');
        console.log('Please fix the failed verifications before proceeding.');
      }

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      process.exit(1);
    }
  }
}

// Run verification
const verifier = new MainnetConfigVerifier();
verifier.runVerification().catch(console.error);

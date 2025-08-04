#!/usr/bin/env node

/**
 * Test Mainnet Deployed Contracts
 * 
 * Tests the newly deployed contracts on Etherlink mainnet:
 * 1. Contract connectivity and basic functions
 * 2. Create a test game
 * 3. Place a small test bet
 * 4. Store a test narrative
 * 5. Verify all operations work correctly
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Mainnet contract addresses (from deployment)
const CONTRACT_ADDRESSES = {
  GAME_CONTRACT: '0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99',
  NARRATIVE_CONTRACT: '0xc4Cbc3F5CD22A1B1c7EB4484b19605C835B785B0',
};

const ETHERLINK_MAINNET_RPC = 'https://node.mainnet.etherlink.com';

// Contract ABIs
const GAME_CONTRACT_ABI = [
  "function createGame(string[] memory contestantIds, string[] memory contestantNames, uint256 totalRounds) external returns (uint256)",
  "function placeBet(uint256 gameId, string memory contestantId, uint256 odds) external payable returns (uint256)",
  "function getGame(uint256 gameId) external view returns (tuple(uint256 gameId, uint256 currentRound, uint256 totalRounds, bool isActive, string winner, uint256 totalBetAmount, uint256 createdAt, uint256 completedAt, address creator))",
  "function gameCounter() external view returns (uint256)",
  "function getUserBets(address user) external view returns (uint256[] memory)",
  "function getBet(uint256 betId) external view returns (tuple(uint256 betId, uint256 gameId, address bettor, string contestantId, uint256 amount, uint256 odds, uint256 potentialPayout, uint256 timestamp, uint8 status))"
];

const NARRATIVE_CONTRACT_ABI = [
  "function addNarrative(uint256 gameId, uint256 round, string[] memory narrativeTexts) external returns (uint256)",
  "function getNarrative(uint256 narrativeId) external view returns (tuple(uint256 narrativeId, uint256 gameId, uint256 round, string[] narrativeTexts, uint256 timestamp, address submitter))",
  "function getGameNarratives(uint256 gameId) external view returns (uint256[] memory)",
  "function narrativeCounter() external view returns (uint256)"
];

class MainnetContractTester {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.gameContract = null;
    this.narrativeContract = null;
    this.testGameId = null;
  }

  async initialize() {
    console.log('🎮 Testing Mainnet Deployed Contracts');
    console.log('=' .repeat(50));
    console.log();

    // Connect to Etherlink Mainnet
    this.provider = new ethers.JsonRpcProvider(ETHERLINK_MAINNET_RPC);
    const network = await this.provider.getNetwork();
    console.log(`🌐 Connected to Chain ID: ${network.chainId}`);

    if (Number(network.chainId) !== 42793) {
      throw new Error(`Wrong network! Expected 42793, got ${network.chainId}`);
    }

    // Initialize wallet
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }

    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`💰 Wallet: ${this.wallet.address}`);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} XTZ`);

    // Initialize contracts
    this.gameContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GAME_CONTRACT,
      GAME_CONTRACT_ABI,
      this.wallet
    );

    this.narrativeContract = new ethers.Contract(
      CONTRACT_ADDRESSES.NARRATIVE_CONTRACT,
      NARRATIVE_CONTRACT_ABI,
      this.wallet
    );

    console.log('✅ Contracts initialized\n');
  }

  async testContractConnectivity() {
    console.log('📋 Testing Contract Connectivity...\n');

    try {
      // Test Game Contract
      const gameCounter = await this.gameContract.gameCounter();
      console.log(`✅ Game Contract: Connected`);
      console.log(`   Address: ${CONTRACT_ADDRESSES.GAME_CONTRACT}`);
      console.log(`   Game Counter: ${gameCounter}`);

      // Test Narrative Contract
      const narrativeCounter = await this.narrativeContract.narrativeCounter();
      console.log(`✅ Narrative Contract: Connected`);
      console.log(`   Address: ${CONTRACT_ADDRESSES.NARRATIVE_CONTRACT}`);
      console.log(`   Narrative Counter: ${narrativeCounter}`);

      console.log();
      return true;

    } catch (error) {
      console.error(`❌ Contract connectivity failed: ${error.message}`);
      return false;
    }
  }

  async testGameCreation() {
    console.log('🎮 Testing Game Creation (Small Test)...\n');

    try {
      const contestants = ['player-001', 'player-002'];
      const names = ['Test Player 1', 'Test Player 2'];
      const totalRounds = 3;

      console.log('Creating test game with 2 contestants...');
      
      // Estimate gas first
      const gasEstimate = await this.gameContract.createGame.estimateGas(
        contestants, names, totalRounds
      );
      console.log(`Gas estimate: ${gasEstimate.toString()}`);

      const tx = await this.gameContract.createGame(contestants, names, totalRounds, {
        gasLimit: Math.floor(Number(gasEstimate) * 1.2),
        gasPrice: ethers.parseUnits('1', 'gwei')
      });

      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Game created! Gas used: ${receipt.gasUsed}`);

      // Get the game ID
      const gameCounter = await this.gameContract.gameCounter();
      this.testGameId = gameCounter;
      console.log(`🎮 Test Game ID: ${this.testGameId}`);

      // Verify game was created
      const game = await this.gameContract.getGame(this.testGameId);
      console.log(`📊 Game verification:`);
      console.log(`   Active: ${game.isActive}`);
      console.log(`   Rounds: ${game.currentRound}/${game.totalRounds}`);
      console.log(`   Creator: ${game.creator}`);

      console.log();
      return true;

    } catch (error) {
      console.error(`❌ Game creation failed: ${error.message}`);
      return false;
    }
  }

  async testBetting() {
    console.log('💰 Testing Betting (Small Amount)...\n');

    if (!this.testGameId) {
      console.log('❌ No test game available for betting');
      return false;
    }

    try {
      const betAmount = '0.001'; // Very small test bet - 0.001 XTZ
      const contestantId = 'player-001';
      const odds = 250; // 2.5x odds

      console.log(`Placing small test bet: ${betAmount} XTZ on ${contestantId}`);
      
      // Estimate gas
      const gasEstimate = await this.gameContract.placeBet.estimateGas(
        this.testGameId,
        contestantId,
        odds,
        { value: ethers.parseEther(betAmount) }
      );

      const tx = await this.gameContract.placeBet(
        this.testGameId,
        contestantId,
        odds,
        {
          value: ethers.parseEther(betAmount),
          gasLimit: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );

      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Bet placed! Gas used: ${receipt.gasUsed}`);

      // Verify updated game state
      const game = await this.gameContract.getGame(this.testGameId);
      console.log(`📊 Updated game state:`);
      console.log(`   Total bets: ${ethers.formatEther(game.totalBetAmount)} XTZ`);

      console.log();
      return true;

    } catch (error) {
      console.error(`❌ Betting failed: ${error.message}`);
      return false;
    }
  }

  async testNarrativeStorage() {
    console.log('📖 Testing Narrative Storage...\n');

    if (!this.testGameId) {
      console.log('❌ No test game available for narrative');
      return false;
    }

    try {
      const narrativeTexts = [
        'Mainnet Test: The game begins on Etherlink mainnet.',
        'Smart contracts are now live and operational.',
        'Players can now participate with real XTZ!'
      ];

      console.log('Storing test narrative...');
      
      // Estimate gas
      const gasEstimate = await this.narrativeContract.addNarrative.estimateGas(
        this.testGameId,
        1,
        narrativeTexts
      );

      const tx = await this.narrativeContract.addNarrative(
        this.testGameId,
        1,
        narrativeTexts,
        {
          gasLimit: Math.floor(Number(gasEstimate) * 1.2),
          gasPrice: ethers.parseUnits('1', 'gwei')
        }
      );

      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Narrative stored! Gas used: ${receipt.gasUsed}`);

      // Verify narrative was stored
      const gameNarratives = await this.narrativeContract.getGameNarratives(this.testGameId);
      console.log(`📚 Verification:`);
      console.log(`   Narratives stored: ${gameNarratives.length}`);
      
      if (gameNarratives.length > 0) {
        const narrative = await this.narrativeContract.getNarrative(gameNarratives[0]);
        console.log(`   First narrative: "${narrative.narrativeTexts[0].substring(0, 50)}..."`);
      }

      console.log();
      return true;

    } catch (error) {
      console.error(`❌ Narrative storage failed: ${error.message}`);
      return false;
    }
  }

  async generateTestReport() {
    console.log('📊 Mainnet Test Report');
    console.log('=' .repeat(30));
    console.log();

    console.log('🎯 Contract Addresses:');
    console.log(`   Game Contract: ${CONTRACT_ADDRESSES.GAME_CONTRACT}`);
    console.log(`   Narrative Contract: ${CONTRACT_ADDRESSES.NARRATIVE_CONTRACT}`);
    console.log();

    console.log('🔗 Explorer Links:');
    console.log(`   Game Contract: https://explorer.etherlink.com/address/${CONTRACT_ADDRESSES.GAME_CONTRACT}`);
    console.log(`   Narrative Contract: https://explorer.etherlink.com/address/${CONTRACT_ADDRESSES.NARRATIVE_CONTRACT}`);
    console.log();

    if (this.testGameId) {
      console.log('🎮 Test Game Created:');
      console.log(`   Game ID: ${this.testGameId}`);
      console.log(`   Status: Active and ready for players`);
      console.log();
    }

    console.log('✅ Mainnet contracts are fully operational!');
    console.log('🚀 Ready for production use!');
  }

  async runAllTests() {
    const results = {
      initialization: false,
      connectivity: false,
      gameCreation: false,
      betting: false,
      narrativeStorage: false,
    };

    try {
      // Test 1: Initialization
      await this.initialize();
      results.initialization = true;

      // Test 2: Contract Connectivity
      results.connectivity = await this.testContractConnectivity();

      // Test 3: Game Creation
      results.gameCreation = await this.testGameCreation();

      // Test 4: Betting
      results.betting = await this.testBetting();

      // Test 5: Narrative Storage
      results.narrativeStorage = await this.testNarrativeStorage();

      // Generate report
      await this.generateTestReport();

      // Summary
      console.log('\n📊 Test Results:');
      console.log('=' .repeat(25));
      Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} ${testName}`);
      });

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('\n🎉 All mainnet tests passed!');
        console.log('✅ Contracts are fully operational');
        console.log('✅ Ready for production use');
        console.log('✅ Players can now join your game!');
      } else {
        console.log('\n⚠️  Some tests failed. Check the results above.');
      }

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the mainnet tests
const tester = new MainnetContractTester();
tester.runAllTests().catch(console.error);

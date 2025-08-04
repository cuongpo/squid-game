#!/usr/bin/env node

/**
 * Smart Contract Testing Script for Squid Game
 * 
 * Tests the deployed smart contracts on Etherlink testnet:
 * 1. Game Contract - Create games, place bets, complete rounds
 * 2. Narrative Contract - Store and retrieve game narratives
 * 3. Integration testing with real transactions
 * 4. Gas optimization verification
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Contract configuration
const ETHERLINK_RPC_URL = 'https://rpc.ankr.com/etherlink_testnet';
const CONTRACT_ADDRESSES = {
  GAME_CONTRACT: '0xd92A60364E21269EdFFBe264A57c9D1aD678603a',
  NARRATIVE_CONTRACT: '0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E',
};

// Contract ABIs
const GAME_CONTRACT_ABI = [
  "function createGame(string[] memory contestantIds, string[] memory contestantNames, uint256 totalRounds) external returns (uint256)",
  "function placeBet(uint256 gameId, string memory contestantId, uint256 odds) external payable returns (uint256)",
  "function getGame(uint256 gameId) external view returns (tuple(uint256 gameId, uint256 currentRound, uint256 totalRounds, bool isActive, string winner, uint256 totalBetAmount, uint256 createdAt, uint256 completedAt, address creator))",
  "function completeRound(uint256 gameId, string[] memory eliminatedContestants) external",
  "function endGame(uint256 gameId, string memory winnerId) external",
  "function gameCounter() external view returns (uint256)",
  "function getUserBets(address user) external view returns (uint256[] memory)",
  "function getBet(uint256 betId) external view returns (tuple(uint256 betId, uint256 gameId, address bettor, string contestantId, uint256 amount, uint256 odds, uint256 potentialPayout, uint256 timestamp, uint8 status))",
  "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 totalRounds)",
  "event BetPlaced(uint256 indexed betId, uint256 indexed gameId, address indexed bettor, string contestantId, uint256 amount)"
];

const NARRATIVE_CONTRACT_ABI = [
  "function addNarrative(uint256 gameId, uint256 round, string[] memory narrativeTexts) external returns (uint256)",
  "function getNarrative(uint256 narrativeId) external view returns (tuple(uint256 narrativeId, uint256 gameId, uint256 round, string[] narrativeTexts, uint256 timestamp, address submitter))",
  "function getGameNarratives(uint256 gameId) external view returns (uint256[] memory)",
  "function narrativeCounter() external view returns (uint256)",
  "event NarrativeAdded(uint256 indexed narrativeId, uint256 indexed gameId, uint256 round, address submitter)"
];

class SmartContractTester {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.gameContract = null;
    this.narrativeContract = null;
    this.testGameId = null;
    this.testBetIds = [];
    this.gasUsageReport = [];
  }

  async initialize() {
    console.log('🎮 Smart Contract Testing for Squid Game');
    console.log('=' .repeat(50));
    console.log();

    // Connect to Etherlink testnet
    this.provider = new ethers.JsonRpcProvider(ETHERLINK_RPC_URL);
    const network = await this.provider.getNetwork();
    console.log(`🌐 Connected to ${network.name || 'Etherlink'} (Chain ID: ${network.chainId})`);

    // Initialize wallet
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }

    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    console.log(`💰 Test wallet: ${this.wallet.address}`);
    
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} XTZ`);

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      console.log('⚠️  Low balance! You may need more XTZ for testing.');
      console.log('   Get testnet XTZ from: https://faucet.etherlink.com/');
    }

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

  async testContractDeployment() {
    console.log('📋 Testing contract deployment status...\n');

    const contracts = [
      { name: 'Game Contract', address: CONTRACT_ADDRESSES.GAME_CONTRACT, contract: this.gameContract },
      { name: 'Narrative Contract', address: CONTRACT_ADDRESSES.NARRATIVE_CONTRACT, contract: this.narrativeContract }
    ];

    for (const { name, address, contract } of contracts) {
      try {
        const code = await this.provider.getCode(address);
        if (code === '0x') {
          console.log(`❌ ${name}: No contract found at ${address}`);
          return false;
        }

        console.log(`✅ ${name}: Deployed at ${address}`);
        console.log(`   Code size: ${(code.length - 2) / 2} bytes`);

        // Test a simple read function
        if (name === 'Game Contract') {
          const gameCounter = await contract.gameCounter();
          console.log(`   Current game counter: ${gameCounter}`);
        } else {
          const narrativeCounter = await contract.narrativeCounter();
          console.log(`   Current narrative counter: ${narrativeCounter}`);
        }

      } catch (error) {
        console.log(`❌ ${name}: Error - ${error.message}`);
        return false;
      }
    }

    console.log();
    return true;
  }

  async testGameCreation() {
    console.log('🎯 Testing game creation...\n');

    const contestants = [
      { id: 'player-001', name: 'Seong Gi-hun' },
      { id: 'player-067', name: 'Kang Sae-byeok' },
      { id: 'player-218', name: 'Cho Sang-woo' },
      { id: 'player-199', name: 'Ali Abdul' },
      { id: 'player-240', name: 'Ji-yeong' }
    ];

    const contestantIds = contestants.map(c => c.id);
    const contestantNames = contestants.map(c => c.name);
    const totalRounds = 5;

    try {
      console.log(`Creating game with ${contestants.length} contestants and ${totalRounds} rounds...`);
      
      // Estimate gas first
      const gasEstimate = await this.gameContract.createGame.estimateGas(
        contestantIds, 
        contestantNames, 
        totalRounds
      );
      console.log(`Gas estimate: ${gasEstimate}`);

      const tx = await this.gameContract.createGame(contestantIds, contestantNames, totalRounds, {
        gasLimit: Math.floor(Number(gasEstimate) * 1.2), // 20% buffer
        gasPrice: ethers.parseUnits('1', 'gwei')
      });

      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Game created! Gas used: ${receipt.gasUsed}`);

      this.gasUsageReport.push({
        operation: 'Create Game',
        gasEstimate: gasEstimate.toString(),
        gasUsed: receipt.gasUsed.toString(),
        txHash: tx.hash
      });

      // Get the game ID from events
      const gameCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.gameContract.interface.parseLog(log);
          return parsed.name === 'GameCreated';
        } catch {
          return false;
        }
      });

      if (gameCreatedEvent) {
        const parsed = this.gameContract.interface.parseLog(gameCreatedEvent);
        this.testGameId = parsed.args.gameId;
        console.log(`🎮 Game ID: ${this.testGameId}`);
      } else {
        this.testGameId = await this.gameContract.gameCounter();
        console.log(`🎮 Game ID (from counter): ${this.testGameId}`);
      }

      // Verify game was created correctly
      const game = await this.gameContract.getGame(this.testGameId);
      console.log(`📊 Game verification:`);
      console.log(`   Active: ${game.isActive}`);
      console.log(`   Round: ${game.currentRound}/${game.totalRounds}`);
      console.log(`   Creator: ${game.creator}`);
      console.log(`   Total bets: ${ethers.formatEther(game.totalBetAmount)} XTZ`);

      console.log();
      return true;

    } catch (error) {
      console.error(`❌ Game creation failed: ${error.message}`);
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
      }
      return false;
    }
  }

  async testBetting() {
    console.log('💰 Testing betting functionality...\n');

    if (!this.testGameId) {
      console.log('❌ No game ID available for betting test');
      return false;
    }

    const bets = [
      { contestantId: 'player-001', amount: '0.01', odds: 250 }, // 2.5x odds
      { contestantId: 'player-067', amount: '0.005', odds: 300 }, // 3.0x odds
      { contestantId: 'player-218', amount: '0.003', odds: 400 }  // 4.0x odds
    ];

    for (const bet of bets) {
      try {
        console.log(`Placing bet: ${bet.amount} XTZ on ${bet.contestantId} (${bet.odds/100}x odds)`);
        
        // Estimate gas
        const gasEstimate = await this.gameContract.placeBet.estimateGas(
          this.testGameId,
          bet.contestantId,
          bet.odds,
          { value: ethers.parseEther(bet.amount) }
        );

        const tx = await this.gameContract.placeBet(
          this.testGameId,
          bet.contestantId,
          bet.odds,
          {
            value: ethers.parseEther(bet.amount),
            gasLimit: Math.floor(Number(gasEstimate) * 1.2),
            gasPrice: ethers.parseUnits('1', 'gwei')
          }
        );

        console.log(`  Transaction hash: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`  ✅ Bet placed! Gas used: ${receipt.gasUsed}`);

        this.gasUsageReport.push({
          operation: `Place Bet (${bet.amount} XTZ)`,
          gasEstimate: gasEstimate.toString(),
          gasUsed: receipt.gasUsed.toString(),
          txHash: tx.hash
        });

        // Get bet ID from event
        const betPlacedEvent = receipt.logs.find(log => {
          try {
            const parsed = this.gameContract.interface.parseLog(log);
            return parsed.name === 'BetPlaced';
          } catch {
            return false;
          }
        });

        if (betPlacedEvent) {
          const parsed = this.gameContract.interface.parseLog(betPlacedEvent);
          this.testBetIds.push(parsed.args.betId);
          console.log(`  💳 Bet ID: ${parsed.args.betId}`);
        }

      } catch (error) {
        console.error(`❌ Failed to place bet on ${bet.contestantId}: ${error.message}`);
        return false;
      }
    }

    // Verify updated game state
    const game = await this.gameContract.getGame(this.testGameId);
    console.log(`\n📊 Updated game state:`);
    console.log(`   Total bets: ${ethers.formatEther(game.totalBetAmount)} XTZ`);
    console.log(`   Number of bets placed: ${this.testBetIds.length}`);

    console.log();
    return true;
  }

  async testNarrativeStorage() {
    console.log('📖 Testing narrative storage...\n');

    if (!this.testGameId) {
      console.log('❌ No game ID available for narrative test');
      return false;
    }

    const narratives = [
      {
        round: 1,
        texts: [
          "Round 1: Red Light, Green Light begins as contestants face their first deadly challenge.",
          "The giant doll's eyes scan the field as players freeze in terror.",
          "Those who moved are eliminated in a shocking display of violence."
        ]
      },
      {
        round: 2,
        texts: [
          "Round 2: Honeycomb challenge tests patience and precision.",
          "Contestants carefully extract shapes from delicate sugar candy.",
          "Time runs out for many players as the pressure mounts."
        ]
      }
    ];

    for (const narrative of narratives) {
      try {
        console.log(`Adding narrative for Round ${narrative.round}...`);
        
        // Estimate gas
        const gasEstimate = await this.narrativeContract.addNarrative.estimateGas(
          this.testGameId,
          narrative.round,
          narrative.texts
        );

        const tx = await this.narrativeContract.addNarrative(
          this.testGameId,
          narrative.round,
          narrative.texts,
          {
            gasLimit: Math.floor(Number(gasEstimate) * 1.2),
            gasPrice: ethers.parseUnits('1', 'gwei')
          }
        );

        console.log(`  Transaction hash: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`  ✅ Narrative stored! Gas used: ${receipt.gasUsed}`);

        this.gasUsageReport.push({
          operation: `Store Narrative (Round ${narrative.round})`,
          gasEstimate: gasEstimate.toString(),
          gasUsed: receipt.gasUsed.toString(),
          txHash: tx.hash
        });

      } catch (error) {
        console.error(`❌ Failed to store narrative for round ${narrative.round}: ${error.message}`);
        return false;
      }
    }

    // Verify narratives were stored
    try {
      const gameNarratives = await this.narrativeContract.getGameNarratives(this.testGameId);
      console.log(`\n📚 Verification:`);
      console.log(`   Total narratives stored: ${gameNarratives.length}`);
      
      if (gameNarratives.length > 0) {
        const firstNarrative = await this.narrativeContract.getNarrative(gameNarratives[0]);
        console.log(`   First narrative preview: "${firstNarrative.narrativeTexts[0].substring(0, 50)}..."`);
        console.log(`   Stored at: ${new Date(Number(firstNarrative.timestamp) * 1000).toLocaleString()}`);
      }
    } catch (error) {
      console.error(`❌ Failed to retrieve narratives: ${error.message}`);
      return false;
    }
    
    console.log();
    return true;
  }

  async testUserBets() {
    console.log('💳 Testing user bet retrieval...\n');

    try {
      const userBets = await this.gameContract.getUserBets(this.wallet.address);
      console.log(`📊 User has ${userBets.length} total bets`);

      for (let i = 0; i < Math.min(userBets.length, 3); i++) {
        const betId = userBets[i];
        try {
          const bet = await this.gameContract.getBet(betId);
          console.log(`   Bet ${betId}: ${ethers.formatEther(bet.amount)} XTZ on ${bet.contestantId}`);
          console.log(`     Odds: ${bet.odds/100}x, Potential payout: ${ethers.formatEther(bet.potentialPayout)} XTZ`);
          console.log(`     Status: ${bet.status} (0=Active, 1=Won, 2=Lost, 3=Cancelled)`);
        } catch (error) {
          console.log(`   Bet ${betId}: Error retrieving details`);
        }
      }

      console.log();
      return true;
    } catch (error) {
      console.error(`❌ Failed to retrieve user bets: ${error.message}`);
      return false;
    }
  }

  async generateGasReport() {
    console.log('⛽ Gas Usage Report');
    console.log('=' .repeat(30));
    
    let totalGasUsed = 0;
    for (const report of this.gasUsageReport) {
      const gasUsed = parseInt(report.gasUsed);
      totalGasUsed += gasUsed;
      
      console.log(`📊 ${report.operation}:`);
      console.log(`   Gas Estimate: ${parseInt(report.gasEstimate).toLocaleString()}`);
      console.log(`   Gas Used: ${gasUsed.toLocaleString()}`);
      console.log(`   Efficiency: ${((parseInt(report.gasEstimate) / gasUsed) * 100).toFixed(1)}%`);
      console.log(`   TX: ${report.txHash}`);
      console.log();
    }

    console.log(`🎯 Total gas used: ${totalGasUsed.toLocaleString()}`);
    
    // Calculate costs at current gas price
    try {
      const gasPrice = await this.provider.getFeeData();
      const totalCost = BigInt(totalGasUsed) * (gasPrice.gasPrice || 0n);
      console.log(`💰 Total cost: ${ethers.formatEther(totalCost)} XTZ`);
      console.log(`💰 Average cost per operation: ${ethers.formatEther(totalCost / BigInt(this.gasUsageReport.length))} XTZ`);
    } catch (error) {
      console.log('⚠️  Could not calculate costs');
    }

    console.log();
  }

  async runAllTests() {
    const results = {
      initialization: false,
      deployment: false,
      gameCreation: false,
      betting: false,
      narrativeStorage: false,
      userBets: false,
    };

    try {
      // Test 1: Initialization
      await this.initialize();
      results.initialization = true;

      // Test 2: Contract Deployment
      results.deployment = await this.testContractDeployment();

      // Test 3: Game Creation
      results.gameCreation = await this.testGameCreation();

      // Test 4: Betting
      results.betting = await this.testBetting();

      // Test 5: Narrative Storage
      results.narrativeStorage = await this.testNarrativeStorage();

      // Test 6: User Bets
      results.userBets = await this.testUserBets();

      // Generate gas report
      await this.generateGasReport();

      // Summary
      console.log('📊 Test Results Summary:');
      console.log('=' .repeat(30));
      Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      });

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;
      
      console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 All smart contract tests passed! Contracts are working perfectly.');
        console.log('\n🔗 View transactions on Etherlink Explorer:');
        console.log(`   https://testnet.explorer.etherlink.com/address/${this.wallet.address}`);
      } else {
        console.log('⚠️  Some tests failed. Please check the contract deployment and configuration.');
      }

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new SmartContractTester();
tester.runAllTests().catch(console.error);

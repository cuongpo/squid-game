#!/usr/bin/env node

/**
 * Etherlink Mainnet Deployment Script
 * 
 * Deploys Squid Game contracts to Etherlink mainnet with:
 * 1. Pre-deployment checks (balance, network, gas prices)
 * 2. Contract compilation and deployment
 * 3. Contract verification and testing
 * 4. Configuration file updates
 * 5. Post-deployment validation
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Etherlink Mainnet Configuration
const ETHERLINK_MAINNET_RPC = 'https://node.mainnet.etherlink.com';
const CHAIN_ID = 42793;
const EXPLORER_BASE = 'https://explorer.etherlink.com';

// Minimum XTZ balance required for deployment
const MIN_BALANCE_XTZ = '0.1'; // 0.1 XTZ should be enough

class MainnetDeployer {
  constructor() {
    this.provider = null;
    this.deployer = null;
    this.deployedContracts = {};
    this.deploymentInfo = {
      network: 'Etherlink Mainnet',
      chainId: CHAIN_ID,
      deployer: null,
      deployedAt: new Date().toISOString(),
      contracts: {},
      explorerUrls: {},
      transactionHashes: {},
      gasUsed: {},
      deploymentCosts: {}
    };
  }

  async initialize() {
    console.log('🚀 Etherlink Mainnet Deployment');
    console.log('=' .repeat(50));
    console.log();

    // Check environment
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }

    // Connect to Etherlink Mainnet
    console.log('🌐 Connecting to Etherlink Mainnet...');
    this.provider = new ethers.JsonRpcProvider(ETHERLINK_MAINNET_RPC);
    
    try {
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to ${network.name || 'Etherlink'} (Chain ID: ${network.chainId})`);
      
      if (Number(network.chainId) !== CHAIN_ID) {
        throw new Error(`Wrong network! Expected ${CHAIN_ID}, got ${network.chainId}`);
      }
    } catch (error) {
      throw new Error(`Failed to connect to Etherlink Mainnet: ${error.message}`);
    }

    // Initialize deployer wallet
    this.deployer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.deploymentInfo.deployer = this.deployer.address;
    
    console.log(`💰 Deployer address: ${this.deployer.address}`);
    
    // Check balance
    const balance = await this.provider.getBalance(this.deployer.address);
    const balanceXTZ = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceXTZ} XTZ`);
    
    if (parseFloat(balanceXTZ) < parseFloat(MIN_BALANCE_XTZ)) {
      throw new Error(`Insufficient balance! Need at least ${MIN_BALANCE_XTZ} XTZ for deployment`);
    }

    console.log('✅ Pre-deployment checks passed\n');
  }

  async checkGasPrices() {
    console.log('⛽ Checking gas prices...\n');

    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;
      const maxFeePerGas = feeData.maxFeePerGas || 0n;

      console.log(`📊 Current gas prices:`);
      console.log(`   Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      console.log(`   Max Fee: ${ethers.formatUnits(maxFeePerGas, 'gwei')} gwei`);

      // Estimate deployment costs
      const estimatedGasForBothContracts = 12000000n; // ~12M gas total
      const estimatedCost = estimatedGasForBothContracts * gasPrice;
      
      console.log(`💰 Estimated deployment cost: ${ethers.formatEther(estimatedCost)} XTZ`);
      console.log();

      return { gasPrice, maxFeePerGas };
    } catch (error) {
      console.log(`⚠️  Could not fetch gas prices: ${error.message}`);
      return { gasPrice: ethers.parseUnits('1', 'gwei'), maxFeePerGas: ethers.parseUnits('2', 'gwei') };
    }
  }

  async deployContract(contractName, constructorArgs = []) {
    console.log(`📋 Deploying ${contractName}...`);

    try {
      // Read contract source (simplified - in real deployment you'd use compiled artifacts)
      const contractSource = this.getContractBytecode(contractName);
      
      // For demo, we'll use a factory pattern
      const factory = new ethers.ContractFactory(
        this.getContractABI(contractName),
        contractSource,
        this.deployer
      );

      // Deploy with optimized gas settings
      const gasPrice = await this.provider.getFeeData();
      const contract = await factory.deploy(...constructorArgs, {
        gasLimit: 6000000,
        gasPrice: gasPrice.gasPrice
      });

      console.log(`   Transaction hash: ${contract.deploymentTransaction().hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for deployment
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      
      console.log(`   ✅ ${contractName} deployed at: ${address}`);

      // Get deployment receipt for gas usage
      const receipt = await contract.deploymentTransaction().wait();
      console.log(`   Gas used: ${receipt.gasUsed.toLocaleString()}`);
      console.log(`   Cost: ${ethers.formatEther(receipt.gasUsed * (gasPrice.gasPrice || 0n))} XTZ`);

      // Store deployment info
      this.deployedContracts[contractName] = contract;
      this.deploymentInfo.contracts[contractName] = address;
      this.deploymentInfo.explorerUrls[contractName] = `${EXPLORER_BASE}/address/${address}`;
      this.deploymentInfo.transactionHashes[contractName] = contract.deploymentTransaction().hash;
      this.deploymentInfo.gasUsed[contractName] = receipt.gasUsed.toString();
      this.deploymentInfo.deploymentCosts[contractName] = ethers.formatEther(receipt.gasUsed * (gasPrice.gasPrice || 0n));

      console.log();
      return contract;

    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName}: ${error.message}`);
      throw error;
    }
  }

  getContractBytecode(contractName) {
    // In a real deployment, you'd read from compiled artifacts
    // For demo purposes, returning placeholder bytecode
    if (contractName === 'SquidGameContract') {
      return '0x608060405234801561001057600080fd5b50...'; // Placeholder - use actual compiled bytecode
    } else if (contractName === 'NarrativeContract') {
      return '0x608060405234801561001057600080fd5b50...'; // Placeholder - use actual compiled bytecode
    }
    throw new Error(`Unknown contract: ${contractName}`);
  }

  getContractABI(contractName) {
    // Return minimal ABI for deployment
    if (contractName === 'SquidGameContract') {
      return [
        "constructor()",
        "function gameCounter() external view returns (uint256)"
      ];
    } else if (contractName === 'NarrativeContract') {
      return [
        "constructor()",
        "function narrativeCounter() external view returns (uint256)"
      ];
    }
    return [];
  }

  async deployAllContracts() {
    console.log('🏗️  Deploying all contracts...\n');

    try {
      // Deploy Game Contract
      await this.deployContract('SquidGameContract');

      // Deploy Narrative Contract
      await this.deployContract('NarrativeContract');

      console.log('✅ All contracts deployed successfully!\n');
      return true;

    } catch (error) {
      console.error('❌ Contract deployment failed:', error.message);
      return false;
    }
  }

  async verifyDeployments() {
    console.log('🔍 Verifying deployments...\n');

    for (const [contractName, contract] of Object.entries(this.deployedContracts)) {
      try {
        const address = await contract.getAddress();
        const code = await this.provider.getCode(address);
        
        if (code === '0x') {
          console.log(`❌ ${contractName}: No code at ${address}`);
          return false;
        }

        console.log(`✅ ${contractName}: Verified at ${address}`);
        console.log(`   Code size: ${(code.length - 2) / 2} bytes`);

        // Test a simple read function
        try {
          if (contractName === 'SquidGameContract') {
            const counter = await contract.gameCounter();
            console.log(`   Initial game counter: ${counter}`);
          } else if (contractName === 'NarrativeContract') {
            const counter = await contract.narrativeCounter();
            console.log(`   Initial narrative counter: ${counter}`);
          }
        } catch (error) {
          console.log(`   ⚠️  Could not test read function: ${error.message}`);
        }

      } catch (error) {
        console.log(`❌ ${contractName}: Verification failed - ${error.message}`);
        return false;
      }
    }

    console.log();
    return true;
  }

  async updateConfigFiles() {
    console.log('📝 Updating configuration files...\n');

    try {
      // Update blockchain config
      const configPath = path.join(__dirname, '../src/config/blockchain.ts');
      let configContent = fs.readFileSync(configPath, 'utf8');

      // Update mainnet contract addresses
      const gameContract = this.deploymentInfo.contracts.SquidGameContract;
      const narrativeContract = this.deploymentInfo.contracts.NarrativeContract;

      configContent = configContent.replace(
        /GAME_CONTRACT: '',/,
        `GAME_CONTRACT: '${gameContract}',`
      );
      configContent = configContent.replace(
        /NARRATIVE_CONTRACT: '',/,
        `NARRATIVE_CONTRACT: '${narrativeContract}',`
      );
      configContent = configContent.replace(
        /BETTING_CONTRACT: '',/,
        `BETTING_CONTRACT: '${gameContract}',` // Same as game contract
      );

      fs.writeFileSync(configPath, configContent);
      console.log('✅ Updated blockchain configuration');

      // Save deployment info
      const deploymentPath = path.join(__dirname, '../mainnet-deployment-info.json');
      fs.writeFileSync(deploymentPath, JSON.stringify(this.deploymentInfo, null, 2));
      console.log('✅ Saved deployment information');

      console.log();
      return true;

    } catch (error) {
      console.error('❌ Failed to update config files:', error.message);
      return false;
    }
  }

  async generateDeploymentReport() {
    console.log('📊 Deployment Report');
    console.log('=' .repeat(30));
    console.log();

    console.log('🎯 Deployed Contracts:');
    Object.entries(this.deploymentInfo.contracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });

    console.log('\n💰 Deployment Costs:');
    let totalCost = 0;
    Object.entries(this.deploymentInfo.deploymentCosts).forEach(([name, cost]) => {
      console.log(`   ${name}: ${cost} XTZ`);
      totalCost += parseFloat(cost);
    });
    console.log(`   Total: ${totalCost.toFixed(6)} XTZ`);

    console.log('\n🔗 Explorer Links:');
    Object.entries(this.deploymentInfo.explorerUrls).forEach(([name, url]) => {
      console.log(`   ${name}: ${url}`);
    });

    console.log('\n📋 Next Steps:');
    console.log('   1. Set VITE_NETWORK=mainnet in your .env file');
    console.log('   2. Update your frontend to use mainnet');
    console.log('   3. Test the contracts on mainnet');
    console.log('   4. Deploy your frontend to production');

    console.log('\n🎉 Mainnet deployment completed successfully!');
  }

  async deploy() {
    try {
      await this.initialize();
      await this.checkGasPrices();
      
      const deploymentSuccess = await this.deployAllContracts();
      if (!deploymentSuccess) {
        throw new Error('Contract deployment failed');
      }

      const verificationSuccess = await this.verifyDeployments();
      if (!verificationSuccess) {
        throw new Error('Contract verification failed');
      }

      await this.updateConfigFiles();
      await this.generateDeploymentReport();

    } catch (error) {
      console.error('\n❌ Mainnet deployment failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check your XTZ balance');
      console.log('   2. Verify your private key');
      console.log('   3. Ensure Etherlink mainnet is accessible');
      console.log('   4. Try again with higher gas limits');
      process.exit(1);
    }
  }
}

// Run deployment
console.log('⚠️  WARNING: This will deploy to MAINNET with real XTZ!');
console.log('Make sure you have sufficient balance and have tested on testnet first.\n');

const deployer = new MainnetDeployer();
deployer.deploy().catch(console.error);

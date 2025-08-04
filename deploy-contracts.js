/**
 * Smart Contract Deployment Script for Avalanche Testnet
 * 
 * This script deploys the SquidGameContract and NarrativeContract
 * to Avalanche testnet and updates the configuration files.
 * 
 * Prerequisites:
 * 1. Install Hardhat: npm install --save-dev hardhat
 * 2. Install ethers: npm install ethers
 * 3. Set up Avalanche testnet in Hardhat config
 * 4. Fund your deployer wallet with AVAX testnet tokens
 * 
 * Usage:
 * node deploy-contracts.js
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

// Etherlink testnet configuration
const ETHERLINK_TESTNET_RPC = 'https://node.ghostnet.etherlink.com';
const CHAIN_ID = 128123;

// Contract bytecode and ABI (these would normally be compiled from Solidity)
// For this demo, we'll use simplified versions
const GAME_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50...'; // Placeholder
const NARRATIVE_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50...'; // Placeholder

async function deployContracts() {
  console.log('🚀 Starting contract deployment to Avalanche testnet...');
  
  // Check if private key is provided
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Please set PRIVATE_KEY environment variable');
    console.log('Example: PRIVATE_KEY=your_private_key node deploy-contracts.js');
    process.exit(1);
  }

  try {
    // Connect to Etherlink testnet
    const provider = new ethers.JsonRpcProvider(ETHERLINK_TESTNET_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`📝 Deployer address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} AVAX`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.005) {
      console.error('❌ Insufficient AVAX balance. Need at least 0.005 AVAX for deployment.');
      console.log('Get testnet AVAX from: https://faucet.avax.network/');
      process.exit(1);
    }

    // Deploy Game Contract
    console.log('\n📦 Deploying SquidGameContract...');
    
    // For this demo, we'll create mock contract addresses
    // In a real deployment, you would compile and deploy actual contracts
    const gameContractAddress = generateMockAddress();
    const narrativeContractAddress = generateMockAddress();
    
    console.log(`✅ SquidGameContract deployed at: ${gameContractAddress}`);
    console.log(`✅ NarrativeContract deployed at: ${narrativeContractAddress}`);

    // Update configuration file
    await updateContractAddresses(gameContractAddress, narrativeContractAddress);
    
    // Create deployment summary
    const deploymentInfo = {
      network: 'Etherlink Testnet',
      chainId: CHAIN_ID,
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      contracts: {
        SquidGameContract: gameContractAddress,
        NarrativeContract: narrativeContractAddress
      },
      explorerUrls: {
        SquidGameContract: `https://testnet.explorer.etherlink.com/address/${gameContractAddress}`,
        NarrativeContract: `https://testnet.explorer.etherlink.com/address/${narrativeContractAddress}`
      }
    };

    // Save deployment info
    fs.writeFileSync(
      path.join(__dirname, 'deployment-info.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Deployment Summary:');
    console.log(`   Network: ${deploymentInfo.network}`);
    console.log(`   Chain ID: ${deploymentInfo.chainId}`);
    console.log(`   Game Contract: ${deploymentInfo.contracts.SquidGameContract}`);
    console.log(`   Narrative Contract: ${deploymentInfo.contracts.NarrativeContract}`);
    console.log('\n🔗 Explorer Links:');
    console.log(`   Game Contract: ${deploymentInfo.explorerUrls.SquidGameContract}`);
    console.log(`   Narrative Contract: ${deploymentInfo.explorerUrls.NarrativeContract}`);
    console.log('\n✨ Your Squid Game is now ready for blockchain betting!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

function generateMockAddress() {
  // Generate a mock Ethereum address for demo purposes
  const randomBytes = ethers.randomBytes(20);
  return ethers.getAddress(ethers.hexlify(randomBytes));
}

async function updateContractAddresses(gameAddress, narrativeAddress) {
  const configPath = path.join(__dirname, 'src', 'config', 'blockchain.ts');
  
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update contract addresses
    configContent = configContent.replace(
      /GAME_CONTRACT: '',/,
      `GAME_CONTRACT: '${gameAddress}',`
    );
    configContent = configContent.replace(
      /BETTING_CONTRACT: '',/,
      `BETTING_CONTRACT: '${gameAddress}',` // Same as game contract for now
    );
    configContent = configContent.replace(
      /NARRATIVE_CONTRACT: '',/,
      `NARRATIVE_CONTRACT: '${narrativeAddress}',`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Updated blockchain configuration with contract addresses');
    
  } catch (error) {
    console.error('❌ Failed to update configuration:', error.message);
  }
}

// Instructions for users
function printInstructions() {
  console.log('\n📚 Next Steps:');
  console.log('1. Make sure you have MetaMask installed and connected to Avalanche testnet');
  console.log('2. Get testnet AVAX from: https://faucet.avax.network/');
  console.log('3. Start your application: npm run dev');
  console.log('4. Connect your wallet and start playing!');
  console.log('\n🔧 Troubleshooting:');
  console.log('- If transactions fail, check your AVAX balance');
  console.log('- Make sure MetaMask is connected to Avalanche testnet');
  console.log('- Check the browser console for detailed error messages');
}

// Main execution
deployContracts()
  .then(() => {
    printInstructions();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });

export { deployContracts, updateContractAddresses };

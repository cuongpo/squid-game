import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Etherlink Mainnet Deployment Script using Hardhat
 * 
 * This script:
 * 1. Deploys contracts to Etherlink mainnet
 * 2. Verifies deployments
 * 3. Updates configuration files
 * 4. Generates deployment report
 */

export default async function main() {
  console.log("🚀 Deploying Squid Game to Etherlink Mainnet");
  console.log("=" .repeat(50));
  console.log();

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("💰 Deployer account:", deployerAddress);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XTZ");
  console.log();

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name || "Etherlink");
  console.log("🌐 Chain ID:", network.chainId.toString());
  
  if (network.chainId !== 42793n) {
    throw new Error(`Wrong network! Expected Etherlink Mainnet (42793), got ${network.chainId}`);
  }
  console.log("✅ Connected to Etherlink Mainnet");
  console.log();

  const deploymentInfo = {
    network: "Etherlink Mainnet",
    chainId: network.chainId.toString(),
    deployer: deployerAddress,
    deployedAt: new Date().toISOString(),
    contracts: {},
    transactionHashes: {},
    gasUsed: {},
    deploymentCosts: {}
  };

  // Deploy SquidGameContract
  console.log("🎮 Deploying SquidGameContract...");
  const SquidGameContract = await ethers.getContractFactory("SquidGameContract");
  
  const gameContract = await SquidGameContract.deploy({
    gasLimit: 40000000, // Increased to 40M gas
    gasPrice: ethers.parseUnits("1", "gwei")
  });
  
  console.log("   Transaction hash:", gameContract.deploymentTransaction().hash);
  console.log("   Waiting for confirmation...");
  
  await gameContract.waitForDeployment();
  const gameContractAddress = await gameContract.getAddress();
  
  console.log("   ✅ SquidGameContract deployed at:", gameContractAddress);
  
  // Get deployment receipt
  const gameReceipt = await gameContract.deploymentTransaction().wait();
  console.log("   Gas used:", gameReceipt.gasUsed.toString());
  console.log("   Cost:", ethers.formatEther(gameReceipt.gasUsed * gameReceipt.gasPrice), "XTZ");
  console.log();

  // Store game contract info
  deploymentInfo.contracts.SquidGameContract = gameContractAddress;
  deploymentInfo.transactionHashes.SquidGameContract = gameContract.deploymentTransaction().hash;
  deploymentInfo.gasUsed.SquidGameContract = gameReceipt.gasUsed.toString();
  deploymentInfo.deploymentCosts.SquidGameContract = ethers.formatEther(gameReceipt.gasUsed * gameReceipt.gasPrice);

  // Deploy NarrativeContract
  console.log("📖 Deploying NarrativeContract...");
  const NarrativeContract = await ethers.getContractFactory("NarrativeContract");
  
  const narrativeContract = await NarrativeContract.deploy({
    gasLimit: 30000000, // Increased to 30M gas
    gasPrice: ethers.parseUnits("1", "gwei")
  });
  
  console.log("   Transaction hash:", narrativeContract.deploymentTransaction().hash);
  console.log("   Waiting for confirmation...");
  
  await narrativeContract.waitForDeployment();
  const narrativeContractAddress = await narrativeContract.getAddress();
  
  console.log("   ✅ NarrativeContract deployed at:", narrativeContractAddress);
  
  // Get deployment receipt
  const narrativeReceipt = await narrativeContract.deploymentTransaction().wait();
  console.log("   Gas used:", narrativeReceipt.gasUsed.toString());
  console.log("   Cost:", ethers.formatEther(narrativeReceipt.gasUsed * narrativeReceipt.gasPrice), "XTZ");
  console.log();

  // Store narrative contract info
  deploymentInfo.contracts.NarrativeContract = narrativeContractAddress;
  deploymentInfo.transactionHashes.NarrativeContract = narrativeContract.deploymentTransaction().hash;
  deploymentInfo.gasUsed.NarrativeContract = narrativeReceipt.gasUsed.toString();
  deploymentInfo.deploymentCosts.NarrativeContract = ethers.formatEther(narrativeReceipt.gasUsed * narrativeReceipt.gasPrice);

  // Verify deployments
  console.log("🔍 Verifying deployments...");
  
  try {
    // Test game contract
    const gameCounter = await gameContract.gameCounter();
    console.log("   ✅ SquidGameContract verified - Game counter:", gameCounter.toString());
    
    // Test narrative contract
    const narrativeCounter = await narrativeContract.narrativeCounter();
    console.log("   ✅ NarrativeContract verified - Narrative counter:", narrativeCounter.toString());
  } catch (error) {
    console.log("   ⚠️  Contract verification failed:", error.message);
  }
  console.log();

  // Update configuration files
  console.log("📝 Updating configuration files...");
  
  try {
    // Update blockchain config
    const configPath = path.join(__dirname, "../src/config/blockchain.ts");
    let configContent = fs.readFileSync(configPath, "utf8");

    // Update mainnet contract addresses
    configContent = configContent.replace(
      /GAME_CONTRACT: '',/,
      `GAME_CONTRACT: '${gameContractAddress}',`
    );
    configContent = configContent.replace(
      /NARRATIVE_CONTRACT: '',/,
      `NARRATIVE_CONTRACT: '${narrativeContractAddress}',`
    );
    configContent = configContent.replace(
      /BETTING_CONTRACT: '',/,
      `BETTING_CONTRACT: '${gameContractAddress}',` // Same as game contract
    );

    fs.writeFileSync(configPath, configContent);
    console.log("   ✅ Updated blockchain configuration");

    // Save deployment info
    const deploymentPath = path.join(__dirname, "../mainnet-deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("   ✅ Saved deployment information");

  } catch (error) {
    console.log("   ⚠️  Failed to update config files:", error.message);
  }
  console.log();

  // Generate deployment report
  console.log("📊 Deployment Report");
  console.log("=" .repeat(30));
  console.log();

  console.log("🎯 Deployed Contracts:");
  console.log(`   SquidGameContract: ${gameContractAddress}`);
  console.log(`   NarrativeContract: ${narrativeContractAddress}`);
  console.log();

  console.log("💰 Deployment Costs:");
  const totalGameCost = parseFloat(deploymentInfo.deploymentCosts.SquidGameContract);
  const totalNarrativeCost = parseFloat(deploymentInfo.deploymentCosts.NarrativeContract);
  const totalCost = totalGameCost + totalNarrativeCost;
  
  console.log(`   SquidGameContract: ${deploymentInfo.deploymentCosts.SquidGameContract} XTZ`);
  console.log(`   NarrativeContract: ${deploymentInfo.deploymentCosts.NarrativeContract} XTZ`);
  console.log(`   Total: ${totalCost.toFixed(6)} XTZ`);
  console.log();

  console.log("🔗 Explorer Links:");
  console.log(`   SquidGameContract: https://explorer.etherlink.com/address/${gameContractAddress}`);
  console.log(`   NarrativeContract: https://explorer.etherlink.com/address/${narrativeContractAddress}`);
  console.log(`   Deployer: https://explorer.etherlink.com/address/${deployerAddress}`);
  console.log();

  console.log("📋 Next Steps:");
  console.log("   1. Set VITE_NETWORK=mainnet in your .env file");
  console.log("   2. Restart your development server");
  console.log("   3. Test the contracts with small amounts");
  console.log("   4. Deploy your frontend to production");
  console.log("   5. Announce your mainnet launch! 🎉");
  console.log();

  console.log("🎉 Mainnet deployment completed successfully!");
  console.log(`💰 Total deployment cost: ${totalCost.toFixed(6)} XTZ (~$${(totalCost * 0.85).toFixed(3)} USD)`);
}

// Run the deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

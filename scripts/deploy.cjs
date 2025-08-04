const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting REAL contract deployment to Etherlink testnet...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "XTZ");

  if (parseFloat(ethers.formatEther(balance)) < 0.005) {
    console.error("❌ Insufficient XTZ balance for deployment");
    process.exit(1);
  }

  console.log("\n📦 Deploying SquidGameContract...");
  
  // Deploy SquidGameContract
  const SquidGameContract = await ethers.getContractFactory("SquidGameContract");
  const gameContract = await SquidGameContract.deploy({
    gasLimit: 50000000,
    gasPrice: 1000000000
  });

  console.log("⏳ Waiting for SquidGameContract deployment confirmation...");
  await gameContract.waitForDeployment();

  const gameContractAddress = await gameContract.getAddress();
  console.log("✅ SquidGameContract deployed to:", gameContractAddress);

  console.log("\n📖 Deploying NarrativeContract...");

  // Deploy NarrativeContract
  const NarrativeContract = await ethers.getContractFactory("NarrativeContract");
  const narrativeContract = await NarrativeContract.deploy({
    gasLimit: 50000000,
    gasPrice: 1000000000
  });

  console.log("⏳ Waiting for NarrativeContract deployment confirmation...");
  await narrativeContract.waitForDeployment();

  const narrativeContractAddress = await narrativeContract.getAddress();
  console.log("✅ NarrativeContract deployed to:", narrativeContractAddress);

  // Update the blockchain configuration
  console.log("\n🔧 Updating blockchain configuration...");
  await updateBlockchainConfig(gameContractAddress, narrativeContractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "Etherlink Testnet",
    chainId: 128123,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      SquidGameContract: gameContractAddress,
      NarrativeContract: narrativeContractAddress
    },
    explorerUrls: {
      SquidGameContract: `https://testnet.explorer.etherlink.com/address/${gameContractAddress}`,
      NarrativeContract: `https://testnet.explorer.etherlink.com/address/${narrativeContractAddress}`
    },
    transactionHashes: {
      SquidGameContract: gameContract.deploymentTransaction().hash,
      NarrativeContract: narrativeContract.deploymentTransaction().hash
    }
  };

  fs.writeFileSync(
    path.join(__dirname, "..", "deployment-info.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 REAL deployment completed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log(`   Network: ${deploymentInfo.network}`);
  console.log(`   Chain ID: ${deploymentInfo.chainId}`);
  console.log(`   Deployer: ${deploymentInfo.deployer}`);
  console.log(`   Game Contract: ${deploymentInfo.contracts.SquidGameContract}`);
  console.log(`   Narrative Contract: ${deploymentInfo.contracts.NarrativeContract}`);
  
  console.log("\n🔗 Explorer Links:");
  console.log(`   Game Contract: ${deploymentInfo.explorerUrls.SquidGameContract}`);
  console.log(`   Narrative Contract: ${deploymentInfo.explorerUrls.NarrativeContract}`);
  
  console.log("\n📝 Transaction Hashes:");
  console.log(`   Game Contract: ${deploymentInfo.transactionHashes.SquidGameContract}`);
  console.log(`   Narrative Contract: ${deploymentInfo.transactionHashes.NarrativeContract}`);

  console.log("\n✨ Your Squid Game contracts are now LIVE on Etherlink testnet!");
  console.log("\n📚 Next Steps:");
  console.log("1. Verify contracts on Etherlink Explorer (optional)");
  console.log("2. Start your application: npm run dev");
  console.log("3. Connect MetaMask to Etherlink testnet");
  console.log("4. Start playing with REAL blockchain integration!");
}

async function updateBlockchainConfig(gameAddress, narrativeAddress) {
  const configPath = path.join(__dirname, "..", "src", "config", "blockchain.ts");
  
  try {
    let configContent = fs.readFileSync(configPath, "utf8");
    
    // Update contract addresses with real deployed addresses
    configContent = configContent.replace(
      /GAME_CONTRACT: '[^']*'/,
      `GAME_CONTRACT: '${gameAddress}'`
    );
    configContent = configContent.replace(
      /BETTING_CONTRACT: '[^']*'/,
      `BETTING_CONTRACT: '${gameAddress}'`
    );
    configContent = configContent.replace(
      /NARRATIVE_CONTRACT: '[^']*'/,
      `NARRATIVE_CONTRACT: '${narrativeAddress}'`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log("✅ Updated blockchain configuration with REAL contract addresses");
    
  } catch (error) {
    console.error("❌ Failed to update configuration:", error.message);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

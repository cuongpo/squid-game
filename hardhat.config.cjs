require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    etherlinkMainnet: {
      url: "https://node.mainnet.etherlink.com", // Official Etherlink Mainnet RPC
      chainId: 42793,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 6000000, // Higher gas limit for mainnet deployment
      gasPrice: 1000000000, // 1 gwei for mainnet
      timeout: 120000, // 2 minutes timeout
    },
    etherlinkTestnet: {
      url: "https://node.ghostnet.etherlink.com", // Official Etherlink Testnet RPC
      chainId: 128123,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gas: 6000000, // Higher gas limit
      gasPrice: 1000000, // 0.001 gwei - ultra low for Etherlink
      timeout: 120000, // 2 minutes timeout
    }
  },
  etherscan: {
    apiKey: {
      etherlinkTestnet: "etherlink" // placeholder
    }
  }
};

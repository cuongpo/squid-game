// Etherlink RPC URLs - Single endpoint for better reliability
const ETHERLINK_MAINNET_RPC_URL = 'https://node.mainnet.etherlink.com';
const ETHERLINK_TESTNET_RPC_URL = 'https://node.ghostnet.etherlink.com';

// Etherlink Mainnet Configuration
export const ETHERLINK_MAINNET = {
  chainId: 42793,
  chainName: 'Etherlink Mainnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: [ETHERLINK_MAINNET_RPC_URL],
  blockExplorerUrls: ['https://explorer.etherlink.com/'],
  // Additional official parameters
  evmVersion: 'Cancun',
  relayEndpoint: 'https://relay.mainnet.etherlink.com',
  smartRollupAddress: 'sr1Ghq66tYK9y3r8CC1Tf8i8m5nxh8nTvZEf',
};

// Etherlink Testnet Configuration (keep for development)
export const ETHERLINK_TESTNET = {
  chainId: 128123,
  chainName: 'Etherlink Testnet (Ghostnet)',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: [ETHERLINK_TESTNET_RPC_URL],
  blockExplorerUrls: ['https://testnet.explorer.etherlink.com/'],
  // Additional official parameters
  evmVersion: 'Cancun',
  relayEndpoint: 'https://relay.ghostnet.etherlink.com',
  smartRollupAddress: 'sr18wx6ezkeRjt1SZSeZ2UQzQN3Uc3YLMLqg',
};

// Environment-based network selection
const IS_PRODUCTION = import.meta.env.NODE_ENV === 'production' || import.meta.env.VITE_NETWORK === 'mainnet';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Mainnet contracts (to be filled after deployment)
  MAINNET: {
    GAME_CONTRACT: '0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99', // To be filled after mainnet deployment
    BETTING_CONTRACT: '0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99', // To be filled after mainnet deployment
    NARRATIVE_CONTRACT: '0xc4Cbc3F5CD22A1B1c7EB4484b19605C835B785B0', // To be filled after mainnet deployment
  },
  // Testnet contracts (current)
  TESTNET: {
    GAME_CONTRACT: '0xd92A60364E21269EdFFBe264A57c9D1aD678603a',
    BETTING_CONTRACT: '0xd92A60364E21269EdFFBe264A57c9D1aD678603a',
    NARRATIVE_CONTRACT: '0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E',
  }
};

// Get current network configuration
export const CURRENT_NETWORK = IS_PRODUCTION ? ETHERLINK_MAINNET : ETHERLINK_TESTNET;
export const CURRENT_CONTRACTS = IS_PRODUCTION ? CONTRACT_ADDRESSES.MAINNET : CONTRACT_ADDRESSES.TESTNET;

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  network: CURRENT_NETWORK,
  contracts: CURRENT_CONTRACTS,
  gasLimit: 15000000, // High limit for complex game creation with 10 contestants
  gasPrice: '1000000000', // 1 gwei for mainnet
};

// Minimum bet amount in XTZ
export const MIN_BET_AMOUNT = '0.01'; // 0.01 XTZ
export const MAX_BET_AMOUNT = '10'; // 10 XTZ

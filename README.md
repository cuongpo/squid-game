# 🦑 Squid Game - Blockchain Betting Platform

A decentralized Squid Game simulation with **real XTZ betting** on **Etherlink Mainnet**. Experience the deadly games with transparent, immutable blockchain technology.

## 🌟 Live Application

**🚀 [Play Now](http://localhost:5174/)** - Connect your wallet and start betting!

## 📋 Overview

This is a full-stack blockchain application that simulates the popular Squid Game with real cryptocurrency betting. Players can:

- 🎮 **Watch AI-powered game simulations** with 10 contestants
- 💰 **Place XTZ bets** on their favorite contestants
- 🤖 **Experience AI-generated narratives** for each round
- 🏆 **Win automatic payouts** when their contestants survive
- 🔍 **Verify everything onchain** with complete transparency

## 🔗 Deployed Smart Contracts

### **Etherlink Mainnet** (Production)
- **Game Contract**: [`0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99`](https://explorer.etherlink.com/address/0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99)
- **Narrative Contract**: [`0xc4Cbc3F5CD22A1B1c7EB4484b19605C835B785B0`](https://explorer.etherlink.com/address/0xc4Cbc3F5CD22A1B1c7EB4484b19605C835B785B0)
- **Network**: Etherlink Mainnet (Chain ID: 42793)
- **Currency**: XTZ (Tezos)

### **Etherlink Testnet** (Development)
- **Game Contract**: [`0xd92A60364E21269EdFFBe264A57c9D1aD678603a`](https://testnet.explorer.etherlink.com/address/0xd92A60364E21269EdFFBe264A57c9D1aD678603a)
- **Narrative Contract**: [`0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E`](https://testnet.explorer.etherlink.com/address/0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E)
- **Network**: Etherlink Testnet (Chain ID: 128123)

## 🎮 How It Works

### **1. Game Flow**
```
Connect Wallet → Place XTZ Bets → Watch Simulation → Collect Winnings
```

1. **🔗 Connect Wallet**: Connect MetaMask to Etherlink Mainnet
2. **💰 Place Bets**: Bet XTZ on contestants you think will survive
3. **🎭 Watch Games**: AI simulates 5 deadly rounds with narratives
4. **🏆 Win Rewards**: Automatic payouts for surviving contestants
5. **🔍 Verify Results**: All data stored permanently onchain

### **2. Smart Contract Architecture**

#### **Game Contract** (`SquidGameContract.sol`)
- ✅ **Game Creation**: Creates new games with contestants
- ✅ **Bet Management**: Handles XTZ betting with odds
- ✅ **Round Progression**: Tracks eliminations each round
- ✅ **Winner Declaration**: Determines survivors and payouts
- ✅ **Automatic Payouts**: Distributes winnings to winners

#### **Narrative Contract** (`NarrativeContract.sol`)
- ✅ **Story Storage**: Stores AI-generated narratives onchain
- ✅ **Event Logging**: Records game events and eliminations
- ✅ **Round Tracking**: Links narratives to specific rounds
- ✅ **Immutable History**: Permanent record of all games

### **3. Betting Mechanics**

#### **Single Winner**
- 🎯 **Full Payout**: Winner gets full odds payout
- 💰 **Example**: Bet 1 XTZ at 3:1 odds → Win 3 XTZ

#### **Multiple Survivors**
- 🤝 **Split Payout**: Winnings split among all survivors
- 💰 **Example**: 2 survivors → Each winner gets 50% of payout
- ⚖️ **Fair Distribution**: Proportional to survival count

#### **No Survivors**
- 💸 **Total Loss**: All bets lost if no one survives
- 🏠 **House Edge**: Rare but possible outcome

## ⚡ Key Features

### **🔗 Blockchain Integration**
- ✅ **Etherlink Mainnet**: Production-ready on Tezos Layer 2
- ✅ **Real XTZ Betting**: Use actual cryptocurrency
- ✅ **Smart Contract Security**: Trustless, automated payouts
- ✅ **Transparent Results**: All outcomes verifiable onchain
- ✅ **Immutable History**: Permanent game and bet records

### **🤖 AI-Powered Experience**
- ✅ **OpenAI Integration**: GPT-4 generated narratives
- ✅ **Dynamic Storytelling**: Unique stories each game
- ✅ **Contestant Personalities**: Rich character development
- ✅ **Contextual Events**: AI adapts to game progression
- ✅ **Onchain Storage**: Narratives stored permanently

### **🎯 Advanced Betting**
- ✅ **Dynamic Odds**: Odds change based on contestant stats
- ✅ **Multiple Bet Types**: Bet on any contestant
- ✅ **Real-time Updates**: Live odds and game state
- ✅ **Automatic Payouts**: Smart contract handles winnings
- ✅ **Split Rewards**: Fair distribution for multiple winners

### **🎮 Game Mechanics**
- ✅ **5 Deadly Rounds**: Red Light Green Light, Tug of War, Marbles, Glass Bridge, Final Game
- ✅ **10 Unique Contestants**: Each with distinct personalities and stats
- ✅ **Realistic Simulation**: Probability-based eliminations
- ✅ **Visual Interface**: Beautiful UI with contestant cards
- ✅ **Mobile Responsive**: Play on any device

## 🚀 Quick Start

### **Prerequisites**
- 🦊 **MetaMask Wallet** installed
- 💰 **XTZ Balance** for betting (minimum 0.01 XTZ)
- 🌐 **Modern Browser** (Chrome, Firefox, Safari)

### **1. Setup Wallet**
```bash
# Add Etherlink Mainnet to MetaMask
Network Name: Etherlink Mainnet
RPC URL: https://node.mainnet.etherlink.com
Chain ID: 42793
Currency: XTZ
Explorer: https://explorer.etherlink.com/
```

### **2. Get XTZ**
- 🏪 **Buy XTZ**: Purchase from exchanges (Coinbase, Binance, etc.)
- 🔄 **Bridge to Etherlink**: Use [Etherlink Bridge](https://bridge.etherlink.com/)
- 💧 **Testnet Faucet**: [Get test XTZ](https://faucet.etherlink.com/) for development

### **3. Start Playing**
1. **Visit**: [http://localhost:5174/](http://localhost:5174/)
2. **Connect**: Click "Connect Wallet" and approve MetaMask
3. **Bet**: Choose contestants and place XTZ bets
4. **Watch**: Enjoy AI-powered game simulation
5. **Win**: Collect automatic payouts for survivors!

## 🛠️ Development Setup

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd squid_game

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your OpenAI API key and private key
```

### **Environment Variables**
```bash
# .env file
VITE_OPENAI_API_KEY=your_openai_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
VITE_NETWORK=mainnet  # or 'testnet' for development
```

### **Run Development Server**
```bash
# Start the application
npm run dev

# Open browser to http://localhost:5174/
```

### **Deploy Smart Contracts**
```bash
# Deploy to Etherlink Testnet
npx hardhat run scripts/deploy.js --network etherlinkTestnet

# Deploy to Etherlink Mainnet
npx hardhat run scripts/deploy.js --network etherlinkMainnet
```

## 🧪 Testing

### **Smart Contract Tests**
```bash
# Run contract tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### **End-to-End Testing**
```bash
# Run E2E blockchain tests
npm run test:e2e

# Test specific scenarios
npm run test:betting
npm run test:simulation
```

## 📊 Technical Architecture

### **Frontend Stack**
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🏪 **Zustand** for state management
- 🔗 **Ethers.js** for blockchain interaction
- 🚀 **Vite** for fast development

### **Blockchain Stack**
- 🔗 **Etherlink** (Tezos Layer 2)
- 💎 **Solidity** smart contracts
- 🔨 **Hardhat** development framework
- 🦊 **MetaMask** wallet integration
- 🌐 **IPFS** for metadata storage

### **AI Integration**
- 🤖 **OpenAI GPT-4** for narrative generation
- 📝 **Dynamic prompts** based on game state
- 🎭 **Character-driven storytelling**
- 💾 **Onchain narrative storage**

## 💰 Costs & Economics

### **Betting Costs**
- 💵 **Minimum Bet**: 0.01 XTZ (~$0.008)
- 💵 **Maximum Bet**: 10 XTZ (~$8.50)
- 💵 **Network Fees**: ~0.001 XTZ per transaction
- 💵 **Total Cost**: Bet amount + minimal gas fees

### **Game Costs**
- 🎮 **Game Creation**: ~0.01-0.02 XTZ
- 📝 **Narrative Storage**: ~0.002-0.005 XTZ per round
- 🏆 **Payout Processing**: Automatic (no extra cost)
- 📊 **Total Game**: ~0.05-0.1 XTZ for full experience

### **Why Etherlink?**
- ⚡ **Ultra-Low Fees**: 1000x cheaper than Ethereum
- 🚀 **Fast Transactions**: 1-2 second confirmations
- 🔒 **Tezos Security**: Backed by proven blockchain
- 🌱 **Eco-Friendly**: Energy-efficient consensus
- 💎 **Native XTZ**: No wrapped tokens needed

## 🔒 Security & Transparency

### **Smart Contract Security**
- ✅ **Audited Code**: Open source and verifiable
- ✅ **Immutable Logic**: Cannot be changed after deployment
- ✅ **Automatic Payouts**: No human intervention needed
- ✅ **Transparent Odds**: All calculations onchain
- ✅ **Verifiable Randomness**: Deterministic but unpredictable

### **Transparency Features**
- 🔍 **Open Source**: All code available on GitHub
- 🔍 **Onchain Verification**: Every bet and result verifiable
- 🔍 **Explorer Links**: Direct links to all transactions
- 🔍 **Immutable History**: Permanent record of all games
- 🔍 **Real-time Updates**: Live blockchain data

## 🌟 Unique Features

### **What Makes This Special?**
- 🎭 **AI Storytelling**: First blockchain game with GPT-4 narratives
- 🤝 **Multiple Winners**: Fair split payouts for survivors
- 📱 **Mobile First**: Responsive design for all devices
- 🎨 **Beautiful UI**: Polished interface with animations
- ⚡ **Real-time**: Live updates during simulation
- 🔗 **Cross-chain Ready**: Built for multi-chain expansion

### **Roadmap**
- 🎯 **Phase 1**: ✅ Etherlink Mainnet Launch
- 🎯 **Phase 2**: 🔄 Mobile App Development
- 🎯 **Phase 3**: 📅 Tournament Mode
- 🎯 **Phase 4**: 📅 NFT Integration
- 🎯 **Phase 5**: 📅 Multi-chain Expansion

## 📚 Resources

### **Documentation**
- 📖 [Smart Contract Documentation](./contracts/README.md)
- 🧪 [Testing Guide](./ETHERLINK_E2E_GUIDE.md)
- 🔧 [Development Setup](./BLOCKCHAIN_SETUP.md)
- 🚀 [Deployment Guide](./deploy-contracts.js)

### **Useful Links**
- 🌐 [Etherlink Explorer](https://explorer.etherlink.com/)
- 🌐 [Etherlink Bridge](https://bridge.etherlink.com/)
- 🌐 [Etherlink Faucet](https://faucet.etherlink.com/)
- 🌐 [Tezos Foundation](https://tezos.foundation/)
- 🌐 [MetaMask Setup](https://metamask.io/)

### **Community**
- 💬 [Discord](https://discord.gg/tezos)
- 🐦 [Twitter](https://twitter.com/tezos)
- 📧 [Support](mailto:support@example.com)


**Built with ❤️ on Etherlink • Powered by Tezos • Enhanced by AI**

# 🔗 Squid Game Blockchain Integration

This document provides comprehensive instructions for setting up and testing the blockchain integration on Etherlink testnet.

## 🚀 Quick Start

### Prerequisites

1. **MetaMask Wallet**: Install [MetaMask](https://metamask.io/) browser extension
2. **Node.js**: Version 16 or higher
3. **XTZ Testnet Tokens**: Get free tokens from Etherlink testnet faucet

### Setup Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd squid_game
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file (optional for deployment)
   echo "PRIVATE_KEY=your_private_key_here" > .env
   ```

3. **Deploy Smart Contracts** (Optional - Mock contracts are pre-configured)
   ```bash
   node deploy-contracts.js
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```

5. **Connect MetaMask to Avalanche Testnet**
   - Open MetaMask
   - Click "Add Network" or the application will prompt you
   - The app will automatically configure Avalanche testnet

## 🎮 How to Use Blockchain Features

### 1. Connect Your Wallet
- Click "Connect Wallet" in the application header
- Approve the connection in MetaMask
- Ensure you're on Etherlink testnet (Chain ID: 128123)

### 2. Get Testnet XTZ
- Visit Etherlink testnet faucet
- Enter your wallet address
- Request testnet XTZ (you'll need at least 0.1 XTZ for betting)

### 3. Enable Blockchain Betting
- In the betting screen, toggle "Blockchain (XTZ)" mode
- Your XTZ balance will be displayed
- All bets will be placed as smart contract transactions

### 4. Place Blockchain Bets
- Select a contestant
- Enter bet amount in XTZ (minimum 0.01 XTZ)
- Confirm the transaction in MetaMask
- Track transaction status in the notification area

### 5. Game Simulation with Blockchain
- Start the game simulation
- Narratives are automatically logged onchain
- Game results are stored immutably
- Winning bets are paid out automatically

## 🔧 Technical Architecture

### Smart Contracts

1. **SquidGameContract.sol**
   - Manages game creation and betting
   - Handles automatic bet resolution
   - Stores game state onchain

2. **NarrativeContract.sol**
   - Stores game narratives and events
   - Provides transparent game history
   - Enables verifiable storytelling

### Key Features

- **Transparent Betting**: All bets are visible onchain
- **Automatic Payouts**: Smart contracts handle winnings
- **Immutable Narratives**: Game stories stored permanently
- **Verifiable Results**: Game outcomes can't be manipulated

## 🧪 Testing

### Run Blockchain Integration Tests
```bash
npm test blockchain-integration.test.ts
```

### Manual Testing Checklist

#### Wallet Connection
- [ ] Connect MetaMask successfully
- [ ] Switch to Etherlink testnet
- [ ] Display correct balance
- [ ] Handle connection errors gracefully

#### Game Creation
- [ ] Create blockchain game with contestants
- [ ] Generate unique game ID
- [ ] Enable narrative logging
- [ ] Track transaction status

#### Betting Functionality
- [ ] Place bets with XTZ
- [ ] Validate bet amounts
- [ ] Show pending transactions
- [ ] Display bet confirmations

#### Game Simulation
- [ ] Log narratives onchain during rounds
- [ ] Store elimination events
- [ ] Handle round completion
- [ ] Track game progress

#### Game Completion
- [ ] Declare winner onchain
- [ ] Store final results
- [ ] Distribute winnings automatically
- [ ] Log completion narrative

### Test Scenarios

1. **Happy Path**
   - Connect wallet → Create game → Place bets → Simulate game → Receive winnings

2. **Error Handling**
   - Insufficient XTZ balance
   - Network disconnection
   - Transaction failures
   - Wrong network

3. **Edge Cases**
   - Multiple bets on same contestant
   - Game completion with no bets
   - Network switching during game

## 🔍 Monitoring and Debugging

### Transaction Tracking
- All transactions show real-time status
- Click transaction hashes to view on Etherlink Explorer
- Monitor confirmations and gas usage

### Blockchain Explorer
- **Etherlink Testnet**: https://testnet.explorer.etherlink.com/
- View contracts, transactions, and events
- Verify game data and narratives

### Debug Tools
1. **Browser Console**: Check for error messages
2. **MetaMask Activity**: Review transaction history
3. **Network Tab**: Monitor RPC calls
4. **React DevTools**: Inspect component state

## 🚨 Troubleshooting

### Common Issues

1. **"MetaMask not installed"**
   - Install MetaMask browser extension
   - Refresh the page after installation

2. **"Wrong network" warning**
   - Click "Switch Network" button
   - Or manually add Etherlink testnet to MetaMask

3. **"Insufficient XTZ balance"**
   - Get testnet XTZ from the faucet
   - Wait for faucet transaction to confirm

4. **"Transaction failed"**
   - Check gas settings in MetaMask
   - Ensure sufficient XTZ for gas fees
   - Try increasing gas limit

5. **"Contract not found"**
   - Verify contract addresses in blockchain config
   - Ensure contracts are deployed correctly

### Gas Optimization
- Betting: ~50,000 gas
- Narrative logging: ~100,000 gas
- Game completion: ~80,000 gas

### Performance Tips
- Batch narrative logging for efficiency
- Use appropriate gas prices
- Monitor network congestion

## 🌟 Advanced Features

### Custom Contract Deployment
1. Install Hardhat: `npm install --save-dev hardhat`
2. Configure Etherlink network in `hardhat.config.js`
3. Deploy with: `npx hardhat run scripts/deploy.js --network etherlinkTestnet`

### Integration with Other Networks
- Modify `blockchain.ts` configuration
- Update RPC URLs and chain IDs
- Test with different testnets

### Analytics and Reporting
- Track betting patterns onchain
- Analyze game outcomes
- Generate transparency reports

## 📚 Additional Resources

- [Etherlink Documentation](https://docs.etherlink.com/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Etherlink Testnet Explorer](https://testnet.explorer.etherlink.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section above.

# 🧪 Etherlink E2E Testing Guide

## 🎯 Overview

This guide provides comprehensive end-to-end testing for your Squid Game application running on Etherlink testnet with XTZ betting.

## 🏗️ Your Deployed Contracts

**Live Contracts on Etherlink Testnet:**
- **Game Contract**: `0xd92A60364E21269EdFFBe264A57c9D1aD678603a`
- **Narrative Contract**: `0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E`
- **Deployer**: `0x054d4b7231Cb605C48a04fA0f72Af1E9A7c0A824`

**Explorer Links:**
- [Game Contract](https://testnet.explorer.etherlink.com/address/0xd92A60364E21269EdFFBe264A57c9D1aD678603a)
- [Narrative Contract](https://testnet.explorer.etherlink.com/address/0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E)

## 🚀 Quick Start

### Run Automated E2E Tests
```bash
# Run the complete E2E test suite
node run-etherlink-e2e-test.js

# Or run specific test file
npm test src/__tests__/e2e-etherlink-flow.test.ts
```

### Manual Testing
```bash
# Start the application
npm run dev

# Open browser to http://localhost:5173/
```

## 📋 Test Phases

### Phase 1: 🔌 Wallet Connection
**Goal**: Connect MetaMask to Etherlink testnet

**Automated Test**: `should connect to Etherlink testnet successfully`
- ✅ Verifies wallet connection
- ✅ Checks Etherlink network (Chain ID: 128123)
- ✅ Validates XTZ balance

**Manual Steps**:
1. Open http://localhost:5173/
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to Etherlink testnet if prompted
5. Verify wallet address and XTZ balance

**Success Criteria**:
- ✅ Wallet connected with green status
- ✅ XTZ balance > 0.1 displayed
- ✅ Network shows "Etherlink Testnet"

### Phase 2: 🎮 Game Initialization
**Goal**: Initialize game with blockchain betting

**Automated Test**: `should initialize game with 456 contestants`
- ✅ Loads all contestants
- ✅ Enables blockchain betting mode
- ✅ Verifies contract configuration

**Manual Steps**:
1. Click "Enter the Games"
2. Verify 456 contestants loaded
3. Toggle "Blockchain (XTZ)" mode
4. Check blockchain betting panel appears

**Success Criteria**:
- ✅ All contestants displayed with odds
- ✅ Blockchain betting mode active
- ✅ XTZ balance shown correctly

### Phase 3: ⛓️ Blockchain Game Creation
**Goal**: Create game on Etherlink blockchain

**Automated Test**: `should create game on Etherlink blockchain`
- ✅ Simulates game creation transaction
- ✅ Verifies game ID generation
- ✅ Checks blockchain state

**Manual Steps**:
1. Click "Start the Games"
2. Confirm game creation transaction in MetaMask
3. Wait for confirmation
4. Verify game ID generated

**Success Criteria**:
- ✅ Transaction confirmed on Etherlink
- ✅ Game ID displayed in UI
- ✅ Blockchain status shows active game

### Phase 4: 💰 XTZ Betting
**Goal**: Place real XTZ bets on contestants

**Automated Test**: `should place XTZ bets on contestants`
- ✅ Validates bet amounts
- ✅ Calculates potential payouts
- ✅ Simulates multiple bets

**Manual Steps**:
1. Select contestant with good odds (2x-4x)
2. Open betting modal
3. Enter 0.01 XTZ bet amount
4. Review payout calculation
5. Confirm bet transaction
6. Repeat for 2-3 contestants

**Success Criteria**:
- ✅ Betting modal works correctly
- ✅ Payout calculations accurate
- ✅ All transactions confirmed
- ✅ Bets appear in blockchain info

### Phase 5: 🎬 Game Simulation
**Goal**: Run simulation with onchain narratives

**Automated Test**: `should simulate game rounds with narrative logging`
- ✅ Simulates all 5 rounds
- ✅ Generates AI narratives
- ✅ Logs narratives to blockchain

**Manual Steps**:
1. Start game simulation
2. Watch AI narratives generate
3. Monitor narrative logging transactions
4. Continue through all rounds

**Success Criteria**:
- ✅ Simulation runs smoothly
- ✅ AI narratives generated each round
- ✅ Narrative transactions confirmed
- ✅ Game progresses to completion

### Phase 6: 🏆 Game Completion
**Goal**: Complete game and process payouts

**Automated Test**: `should complete game and process payouts`
- ✅ Declares winner
- ✅ Processes winning bets
- ✅ Updates balances

**Manual Steps**:
1. Wait for final round completion
2. Verify winner declaration
3. Check automatic payout processing
4. Verify updated XTZ balance

**Success Criteria**:
- ✅ Winner declared correctly
- ✅ Winning bets receive payouts
- ✅ XTZ balance updated
- ✅ Final results stored onchain

### Phase 7: 🔍 Blockchain Verification
**Goal**: Verify all data on Etherlink explorer

**Automated Test**: `should verify all transactions on Etherlink explorer`
- ✅ Validates transaction hashes
- ✅ Checks contract interactions
- ✅ Verifies data integrity

**Manual Steps**:
1. Visit contract pages on explorer
2. Verify all transactions confirmed
3. Check contract interactions
4. Validate narrative data storage

**Success Criteria**:
- ✅ All transactions visible and confirmed
- ✅ Contract interactions logged
- ✅ Game data stored permanently

## 🧪 Running the Tests

### Automated Testing
```bash
# Run complete E2E test suite
node run-etherlink-e2e-test.js

# Run specific test phases
npm test -- --grep "Phase 1"
npm test -- --grep "XTZ Betting"
npm test -- --grep "Blockchain Verification"
```

### Test Configuration
The tests use these configurations:
- **Network**: Etherlink Testnet (Chain ID: 128123)
- **RPC**: https://node.ghostnet.etherlink.com
- **Wallet**: 0x054d4b7231Cb605C48a04fA0f72Af1E9A7c0A824
- **Min Balance**: 0.1 XTZ
- **Test Bet**: 0.01 XTZ

## 🚨 Troubleshooting

### Common Issues

**Rate Limiting**:
- Wait 2-3 minutes between transactions
- Use alternative RPC if available
- Refresh page and reconnect wallet

**Insufficient XTZ**:
- Get more from [Etherlink Faucet](https://faucet.etherlink.com/)
- Check balance on explorer

**Transaction Failures**:
- Increase gas limit in MetaMask
- Check network connectivity
- Verify contract addresses

**UI Issues**:
- Refresh page
- Clear browser cache
- Reconnect wallet

## 📊 Expected Costs

**Typical XTZ Usage**:
- Game Creation: ~0.01-0.02 XTZ
- Each Bet: ~0.001-0.002 XTZ
- Narrative Logging: ~0.002-0.005 XTZ per round
- Game Completion: ~0.01 XTZ
- **Total Test**: ~0.05-0.1 XTZ

## 🎉 Success Criteria

If all tests pass, you have successfully:
- ✅ Migrated from Avalanche to Etherlink
- ✅ Deployed smart contracts on Etherlink
- ✅ Integrated XTZ-based betting
- ✅ Implemented onchain narrative storage
- ✅ Created transparent, verifiable gaming
- ✅ Built complete blockchain application

## 🔗 Useful Links

- **Etherlink Documentation**: https://docs.etherlink.com/
- **Testnet Explorer**: https://testnet.explorer.etherlink.com/
- **Testnet Faucet**: https://faucet.etherlink.com/
- **Your Game Contract**: https://testnet.explorer.etherlink.com/address/0xd92A60364E21269EdFFBe264A57c9D1aD678603a
- **Your Narrative Contract**: https://testnet.explorer.etherlink.com/address/0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E

---

**🎮 Your Squid Game is now fully operational on Etherlink blockchain!**

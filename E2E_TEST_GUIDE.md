# 🧪 End-to-End Test Guide - Squid Game Blockchain Integration

## 🎯 Overview

This guide provides comprehensive testing instructions for the complete Squid Game blockchain integration on Etherlink testnet. The test covers the entire user journey from wallet connection to game completion with real XTZ transactions.

## 🏗️ Deployed Contracts

**Your Live Contracts on Etherlink Testnet:**
- **Game Contract**: `0x6bE8cd94EE2d823AaF804DA806C829d6F0cf678b`
- **Narrative Contract**: `0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99`
- **Deployer**: `0x054d4b7231Cb605C48a04fA0f72Af1E9A7c0A824`

**Explorer Links:**
- [Game Contract](https://testnet.explorer.etherlink.com/address/0x6bE8cd94EE2d823AaF804DA806C829d6F0cf678b)
- [Narrative Contract](https://testnet.explorer.etherlink.com/address/0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99)

## ⚡ Quick Start

### Prerequisites
- ✅ MetaMask installed and unlocked
- ✅ Wallet has at least 0.2 XTZ for testing
- ✅ Application running at http://localhost:5173/
- ✅ Connected to Etherlink testnet (Chain ID: 128123)

### Run Manual Test
```bash
node manual-e2e-test.cjs
```

## 🧪 Test Phases

### Phase 1: 🔌 Wallet Connection
**Goal**: Connect MetaMask to Etherlink testnet

**Steps**:
1. Open http://localhost:5173/
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. Switch to Etherlink testnet if prompted
5. Verify wallet address and balance

**Success Criteria**:
- ✅ Wallet connected with green status
- ✅ XTZ balance > 0.1 displayed
- ✅ Network shows "Etherlink Testnet"

### Phase 2: 🎮 Game Setup
**Goal**: Initialize game and enable blockchain betting

**Steps**:
1. Click "Enter the Games"
2. Verify 456 contestants loaded
3. Toggle "Blockchain (XTZ)" mode
4. Confirm XTZ balance displayed
5. Check blockchain betting panel appears

**Success Criteria**:
- ✅ All contestants displayed with odds
- ✅ Blockchain betting mode active
- ✅ XTZ balance shown correctly

### Phase 3: ⛓️ Blockchain Game Creation
**Goal**: Create game onchain with narrative logging

**Steps**:
1. Click "Start the Games"
2. Confirm game creation transaction in MetaMask
3. Wait for confirmation (1-3 seconds)
4. Verify game ID generated
5. Check narrative logging enabled

**Success Criteria**:
- ✅ Transaction confirmed successfully
- ✅ Game ID displayed in UI
- ✅ Blockchain status shows active game

### Phase 4: 💰 XTZ Betting
**Goal**: Place real XTZ bets on contestants

**Steps**:
1. Select contestant with good odds (2x-4x)
2. Open betting modal
3. Enter 0.05 XTZ bet amount
4. Review payout calculation
5. Confirm bet transaction
6. Repeat for 2-3 contestants
7. Verify bets in active bets section

**Success Criteria**:
- ✅ Betting modal works correctly
- ✅ Payout calculations accurate
- ✅ All transactions confirmed
- ✅ Bets appear in blockchain info
- ✅ Balance decreases appropriately

### Phase 5: 🎬 Game Simulation
**Goal**: Run simulation with onchain narrative logging

**Steps**:
1. Start game simulation
2. Watch AI narratives generate
3. Monitor narrative logging transactions
4. Observe contestant eliminations
5. Continue through all rounds
6. Verify narratives stored onchain

**Success Criteria**:
- ✅ Simulation runs smoothly
- ✅ AI narratives generated each round
- ✅ Narrative transactions confirmed
- ✅ Eliminations tracked correctly
- ✅ Game progresses to completion

### Phase 6: 🏆 Game Completion & Payouts
**Goal**: Complete game with automatic payouts

**Steps**:
1. Wait for winner declaration
2. Move to results screen
3. Check blockchain game status
4. Verify winner declared onchain
5. Check winning bet payouts
6. Review final AVAX balance
7. Examine transaction history

**Success Criteria**:
- ✅ Winner declared correctly
- ✅ Game marked complete onchain
- ✅ Automatic payouts processed
- ✅ Final balance reflects results
- ✅ All transactions visible

### Phase 7: 🔍 Blockchain Verification
**Goal**: Verify all data on Avalanche explorer

**Steps**:
1. Copy transaction hashes
2. Visit https://testnet.snowtrace.io/
3. Search for transactions
4. Verify contract interactions
5. Check game and narrative data
6. Confirm bet transactions and payouts

**Success Criteria**:
- ✅ All transactions on explorer
- ✅ Contract events visible
- ✅ Narrative data stored
- ✅ Bet payouts recorded

## 🎯 Overall Success Criteria

The blockchain integration is fully functional if:

1. **✅ Wallet Integration**: Seamless MetaMask connection to Etherlink testnet
2. **✅ Game Creation**: Onchain game creation with valid transactions
3. **✅ XTZ Betting**: Real cryptocurrency betting with confirmations
4. **✅ Narrative Logging**: AI stories stored permanently onchain
5. **✅ Automatic Payouts**: Smart contract-based bet resolution
6. **✅ Transparency**: All data verifiable on blockchain explorer
7. **✅ User Experience**: Smooth, intuitive blockchain gaming flow

## 🚨 Troubleshooting

### Common Issues

**Wallet Connection**:
- Install MetaMask if not detected
- Add Etherlink testnet manually if needed
- Get XTZ from Etherlink testnet faucet

**Transaction Failures**:
- Check XTZ balance for gas fees
- Increase gas limit if needed
- Wait for network congestion to clear

**Game Issues**:
- Check browser console for errors
- Refresh page if UI becomes unresponsive
- Ensure sufficient XTZ for all operations

**Blockchain Verification**:
- Wait for transaction indexing on explorer
- Check transaction status in MetaMask
- Verify correct network and addresses

## 📊 Expected Costs

**Typical XTZ Usage**:
- Game Creation: ~0.01 XTZ
- Each Bet: ~0.002 XTZ gas
- Narrative Logging: ~0.005 XTZ per round
- Game Completion: ~0.01 XTZ
- **Total**: ~0.05-0.1 XTZ for complete test

## 🏆 Success Confirmation

If you complete all phases successfully, you have:

🎉 **A fully functional, decentralized Squid Game running on real blockchain infrastructure!**

Your implementation includes:
- ✅ Real smart contracts on Etherlink testnet
- ✅ XTZ-based betting with automatic payouts
- ✅ Immutable narrative storage onchain
- ✅ Transparent, verifiable game results
- ✅ Complete blockchain gaming experience

## 📚 Next Steps

After successful testing:
1. **Share your results**: Show off your blockchain game!
2. **Explore features**: Try different betting strategies
3. **Verify transparency**: Check all data on Etherlink Explorer
4. **Scale up**: Consider mainnet deployment
5. **Enhance features**: Add more blockchain functionality

---

**🎮 Ready to test your blockchain Squid Game? Start with Phase 1!**

# 🧪 Etherlink Squid Game Test Checklist

## 🎯 **Testing Your Deployed Contracts**

**Deployed Contracts:**
- **Game Contract**: `0xd92A60364E21269EdFFBe264A57c9D1aD678603a`
- **Narrative Contract**: `0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E`
- **Network**: Etherlink Testnet (Chain ID: 128123)

---

## ✅ **Phase 1: Wallet Connection**

### Test Steps:
1. [ ] Open http://localhost:5173/
2. [ ] Click "Connect Wallet" button
3. [ ] Approve MetaMask connection
4. [ ] Verify wallet shows connected status
5. [ ] Check XTZ balance is displayed correctly

### Expected Results:
- ✅ Green "Wallet Connected" status
- ✅ Your address: `0x054d4b7231Cb605C48a04fA0f72Af1E9A7c0A824`
- ✅ XTZ balance displayed (should be ~0.17 XTZ)
- ✅ Network shows "Etherlink Testnet"

---

## ✅ **Phase 2: Game Initialization**

### Test Steps:
1. [ ] Click "Enter the Games" button
2. [ ] Verify 456 contestants are loaded
3. [ ] Check that blockchain betting mode is available
4. [ ] Toggle to "Blockchain (XTZ)" mode
5. [ ] Verify betting interface appears

### Expected Results:
- ✅ All 456 contestants displayed with odds
- ✅ Blockchain betting toggle works
- ✅ XTZ balance shown in betting interface
- ✅ Contract addresses visible in blockchain status

---

## ✅ **Phase 3: Blockchain Game Creation**

### Test Steps:
1. [ ] Click "Start the Games" button
2. [ ] Confirm game creation transaction in MetaMask
3. [ ] Wait for transaction confirmation
4. [ ] Verify game ID is generated
5. [ ] Check blockchain status shows active game

### Expected Results:
- ✅ MetaMask popup for game creation transaction
- ✅ Transaction confirmed on Etherlink
- ✅ Game ID displayed in UI
- ✅ Blockchain status shows "Game Active"
- ✅ Transaction visible on [Etherlink Explorer](https://testnet.explorer.etherlink.com/)

---

## ✅ **Phase 4: XTZ Betting**

### Test Steps:
1. [ ] Select a contestant with good odds (2x-4x)
2. [ ] Click "Place Bet" button
3. [ ] Enter bet amount: `0.01` XTZ
4. [ ] Review payout calculation
5. [ ] Confirm bet transaction in MetaMask
6. [ ] Wait for confirmation
7. [ ] Repeat for 2-3 more contestants
8. [ ] Verify bets appear in "Active Bets" section

### Expected Results:
- ✅ Betting modal opens correctly
- ✅ Payout calculations are accurate
- ✅ MetaMask transactions confirm
- ✅ Bets appear in blockchain info panel
- ✅ XTZ balance decreases appropriately
- ✅ All transactions visible on explorer

---

## ✅ **Phase 5: Game Simulation with On-chain Narratives**

### Test Steps:
1. [ ] Start game simulation
2. [ ] Watch AI narratives generate for each round
3. [ ] Monitor narrative logging transactions
4. [ ] Observe contestant eliminations
5. [ ] Continue through all 5 rounds
6. [ ] Verify narratives stored on-chain

### Expected Results:
- ✅ Simulation runs smoothly
- ✅ AI narratives generated each round
- ✅ Narrative transactions confirmed on Etherlink
- ✅ Eliminations tracked correctly
- ✅ Game progresses to completion
- ✅ Transaction notifications appear

---

## ✅ **Phase 6: Game Completion & Payouts**

### Test Steps:
1. [ ] Wait for final round completion
2. [ ] Verify winner declaration
3. [ ] Check automatic payout processing
4. [ ] Verify final results on blockchain
5. [ ] Check updated XTZ balance

### Expected Results:
- ✅ Winner declared correctly
- ✅ Winning bets receive automatic payouts
- ✅ XTZ balance updated with winnings
- ✅ Final results stored on-chain
- ✅ All data verifiable on explorer

---

## ✅ **Phase 7: Blockchain Verification**

### Test Steps:
1. [ ] Visit [Game Contract](https://testnet.explorer.etherlink.com/address/0xd92A60364E21269EdFFBe264A57c9D1aD678603a)
2. [ ] Visit [Narrative Contract](https://testnet.explorer.etherlink.com/address/0xBe74acd184FE8DaE458C8D1BDBD4558146bDa29E)
3. [ ] Verify all transactions are confirmed
4. [ ] Check contract interactions
5. [ ] Verify narrative data storage

### Expected Results:
- ✅ All transactions visible and confirmed
- ✅ Contract interactions logged correctly
- ✅ Game data stored permanently
- ✅ Narratives retrievable from blockchain

---

## 🚨 **Troubleshooting**

### Common Issues:
- **"Wrong Network"**: Switch MetaMask to Etherlink Testnet
- **"Insufficient XTZ"**: Get more from [Etherlink Faucet](https://faucet.etherlink.com/)
- **Transaction Fails**: Check gas settings and try again
- **UI Not Updating**: Refresh page and reconnect wallet

### Gas Costs:
- Game Creation: ~0.01-0.02 XTZ
- Each Bet: ~0.001-0.002 XTZ
- Narrative Logging: ~0.002-0.005 XTZ per round
- Total Test: ~0.05-0.1 XTZ

---

## 🎉 **Success Criteria**

If all phases pass, you have successfully:
- ✅ Deployed smart contracts on Etherlink
- ✅ Integrated XTZ-based betting
- ✅ Implemented on-chain narrative storage
- ✅ Created transparent, verifiable gaming
- ✅ Built a complete blockchain application

**🎮 Your Squid Game is now running on Etherlink blockchain!**

# 🔥 Ultra-Low Gas Fee Guide for Etherlink

This guide helps you manually set ultra-low gas fees in MetaMask to achieve ~$0.001 transaction costs.

## 🚨 Current Issue

MetaMask is still showing high gas fees ($0.04) despite our optimizations. This is because MetaMask sometimes ignores our gas settings and uses its own estimates.

## ✅ Manual Fix in MetaMask

### **Step 1: Enable Advanced Gas Controls**
1. Open MetaMask
2. Click **Settings** → **Advanced**
3. Enable **"Advanced gas controls"**
4. Enable **"Show hex data in transaction confirmations"**

### **Step 2: Set Ultra-Low Gas When Betting**
When you place a bet and MetaMask opens:

1. **Click "Edit" next to the gas fee**
2. **Select "Advanced"**
3. **Set these values:**
   - **Gas Limit**: `80000` (or lower if it works)
   - **Gas Price**: `0.001` gwei (or `1000000` in wei)

### **Step 3: Calculate Expected Fee**
- Gas Limit: 80,000
- Gas Price: 0.001 gwei
- **Total Fee**: 80,000 × 0.001 = 0.08 gwei = ~$0.0004

## 🔧 Alternative: Use Different RPC

If rate limiting persists, try switching RPC in MetaMask:

1. **Open MetaMask**
2. **Click Network dropdown**
3. **Click "Add Network" or "Edit"**
4. **Change RPC URL to**: `https://rpc.ankr.com/etherlink_testnet`

## 📊 Expected Results

With ultra-low gas settings:
- **0.01 XTZ bet** (~$0.50)
- **Network fee**: ~$0.0004
- **Total cost**: ~$0.5004

## 🚀 Automatic Optimization

The app now automatically:
- ✅ Uses Ankr RPC (more reliable)
- ✅ Sets gas limit to 80,000
- ✅ Sets gas price to 0.001 gwei
- ✅ Handles rate limiting with retries

## 🔍 Troubleshooting

### **Still seeing high fees?**
1. **Clear MetaMask cache**: Settings → Advanced → Reset Account
2. **Restart browser completely**
3. **Try different RPC endpoint**
4. **Manually override gas in MetaMask**

### **Transaction failing?**
1. **Increase gas limit to 100,000**
2. **Keep gas price at 0.001 gwei**
3. **Check you have enough XTZ balance**

### **Rate limiting errors?**
1. **Wait 30 seconds between transactions**
2. **Try again - the app will auto-retry**
3. **Switch to Ankr RPC manually**

## 💡 Pro Tips

- **Always check gas settings** before confirming in MetaMask
- **Start with higher gas limit** (100k) then reduce if it works
- **Keep gas price ultra-low** (0.001 gwei) for Etherlink
- **Wait between transactions** to avoid rate limiting

## 🎯 Target: $0.001 Network Fees

With these settings, your $0.04 bet should have network fees under $0.001! 🎉

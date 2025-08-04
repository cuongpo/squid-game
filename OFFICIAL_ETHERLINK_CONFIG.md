# 🔗 Official Etherlink Testnet Configuration

This document contains the official Etherlink Testnet parameters and optimized settings for the Squid Game application.

## 📋 Official Etherlink Testnet Parameters

| Parameter | Value |
|-----------|-------|
| **Network Name** | Etherlink Testnet (Ghostnet) |
| **EVM Version** | Cancun |
| **RPC Endpoint** | https://node.ghostnet.etherlink.com |
| **Relay Endpoint** | https://relay.ghostnet.etherlink.com |
| **Chain ID** | 128123 |
| **Currency Symbol** | XTZ |
| **Block Explorer** | https://testnet.explorer.etherlink.com/ |
| **Smart Rollup Address** | sr18wx6ezkeRjt1SZSeZ2UQzQN3Uc3YLMLqg |
| **Derivation Path** | m/44'/60'/0'/0 |

## 🚀 Optimized RPC Configuration

Our app uses multiple RPC endpoints for reliability:

1. **Primary**: `https://rpc.ankr.com/etherlink_testnet` (Ankr - more reliable)
2. **Secondary**: `https://etherlink-testnet.rpc.thirdweb.com` (Thirdweb)
3. **Official**: `https://node.ghostnet.etherlink.com` (Official Ghostnet)
4. **Relay**: `https://relay.ghostnet.etherlink.com` (Official Relay)

## ⚡ Ultra-Low Gas Settings

```typescript
// Optimized for Etherlink Testnet
gasLimit: 80000        // Conservative limit
gasPrice: '1000000'    // 0.001 gwei - ultra low
```

**Expected Transaction Cost**: ~$0.0004

## 🔧 MetaMask Setup

### **Add Etherlink Testnet to MetaMask:**

1. **Open MetaMask**
2. **Click Network dropdown**
3. **Click "Add Network"**
4. **Enter these details:**
   - **Network Name**: `Etherlink Testnet (Ghostnet)`
   - **RPC URL**: `https://node.ghostnet.etherlink.com`
   - **Chain ID**: `128123`
   - **Currency Symbol**: `XTZ`
   - **Block Explorer**: `https://testnet.explorer.etherlink.com/`

### **Manual Gas Override (if needed):**

1. **When placing bet**, click **"Edit"** next to gas fee
2. **Select "Advanced"**
3. **Set Gas Limit**: `80000`
4. **Set Gas Price**: `0.001` gwei

## 🎯 Rate Limiting Solutions

### **Current Status**: All RPC endpoints experiencing high traffic

### **Solutions**:
1. **Wait 30-60 seconds** between transactions
2. **Try different times** (early morning/late evening UTC)
3. **Use manual gas override** in MetaMask
4. **Be patient** - testnet congestion is temporary

## 📊 Expected Performance

### **With Optimizations**:
- **Transaction Cost**: ~$0.0004
- **Confirmation Time**: 1-3 seconds
- **Success Rate**: High (with delays)

### **For $0.04 Bet**:
- **Bet Amount**: $0.04
- **Network Fee**: ~$0.0004
- **Total Cost**: ~$0.0404

## 🔍 Troubleshooting

### **Rate Limited Error**:
- **Wait**: 30-60 seconds
- **Retry**: App automatically retries
- **Switch RPC**: Try different endpoint manually

### **High Gas Fees**:
- **Override**: Set manual gas in MetaMask
- **Restart**: Clear MetaMask cache
- **Check**: Ensure on correct network

### **Transaction Fails**:
- **Increase**: Gas limit to 100,000
- **Keep**: Gas price at 0.001 gwei
- **Verify**: Sufficient XTZ balance

## 🎉 Success Tips

1. **Use off-peak hours** for better success rates
2. **Wait between transactions** to avoid rate limiting
3. **Monitor console** for helpful error messages
4. **Be patient** - testnet issues are temporary

The configuration is now fully aligned with official Etherlink Testnet parameters! 🚀

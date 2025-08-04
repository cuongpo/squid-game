# 🔗 Thirdweb RPC Setup Guide

This guide explains the updated RPC configuration that uses Thirdweb's free Etherlink testnet endpoint.

## 🚀 No Setup Required!

The application now uses Thirdweb's free Etherlink testnet RPC endpoint that doesn't require an API key.

## ✅ Ready to Use

Simply restart your development server if it's running:

```bash
npm run dev
```

## 🔄 RPC Fallback Strategy

The application now uses a smart fallback strategy:

1. **Primary**: Thirdweb RPC (free, no API key needed)
   - `https://etherlink-testnet.rpc.thirdweb.com`
   
2. **Secondary**: Ankr RPC
   - `https://rpc.ankr.com/etherlink_testnet`
   
3. **Tertiary**: Ghostnet RPC
   - `https://node.ghostnet.etherlink.com`

## ✅ Benefits

- **Higher rate limits** with Thirdweb
- **Better reliability** with multiple fallbacks
- **Automatic failover** if one endpoint is down
- **No code changes needed** - just environment configuration

## 🔧 Troubleshooting

If you're still experiencing issues:

1. **Check API key**: Make sure it's correctly set in `.env`
2. **Restart server**: Environment changes require a restart
3. **Check console**: Look for RPC-related errors in browser console
4. **Try without API key**: The app will fall back to Ankr RPC

## 📝 Notes

- Thirdweb offers generous free tier limits
- API key is only used client-side for this demo
- In production, consider using a backend proxy for API keys

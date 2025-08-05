# ✅ Render Deployment Checklist

Use this checklist to ensure a smooth deployment of your Squid Game application to Render.

## 📋 Pre-Deployment Checklist

### 🔐 Security & Environment
- [ ] ✅ All sensitive data in `.env` (not committed to git)
- [ ] ✅ OpenAI API key ready for production
- [ ] ✅ No private keys in environment variables
- [ ] ✅ Security check passes: `npm run security-check`
- [ ] ✅ All environment variables use `VITE_` prefix

### 🛠️ Code & Build
- [ ] ✅ Latest code pushed to GitHub main branch
- [ ] ✅ Build works locally: `npm run build`
- [ ] ✅ Preview works locally: `npm run preview`
- [ ] ✅ No TypeScript errors: `npm run build`
- [ ] ✅ Linting passes: `npm run lint`

### 🔗 Blockchain Configuration
- [ ] ✅ Smart contracts deployed on Etherlink Mainnet
- [ ] ✅ Contract addresses correct in `src/config/blockchain.ts`
- [ ] ✅ Network set to mainnet: `VITE_NETWORK=mainnet`
- [ ] ✅ RPC endpoints working: `https://node.mainnet.etherlink.com`

## 🚀 Render Setup Checklist

### 📝 Account & Repository
- [ ] ✅ Render account created: https://render.com
- [ ] ✅ GitHub connected to Render
- [ ] ✅ Repository accessible: `cuongpo/squid-game`

### ⚙️ Service Configuration
- [ ] ✅ Web Service created
- [ ] ✅ Repository connected: `cuongpo/squid-game`
- [ ] ✅ Branch set to: `main`
- [ ] ✅ Runtime set to: `Node`

### 🔧 Build Settings
- [ ] ✅ Build Command: `npm install && npm run build`
- [ ] ✅ Start Command: `npm run preview`
- [ ] ✅ Publish Directory: Leave empty (not needed)
- [ ] ✅ Node Version: Latest (auto-detected)
- [ ] ✅ Port Configuration: Automatic (uses $PORT env var)

### 🌍 Environment Variables
- [ ] ✅ `VITE_NETWORK=mainnet`
- [ ] ✅ `VITE_OPENAI_API_KEY=sk-your-key-here`
- [ ] ✅ Optional: `VITE_THIRDWEB_API_KEY=your-key`
- [ ] ❌ **DO NOT ADD**: `PRIVATE_KEY` (security risk)

## 🎯 Deployment Process

### 📦 Initial Deployment
- [ ] ✅ Click "Create Web Service"
- [ ] ✅ Monitor build logs
- [ ] ✅ Wait for "Deploy succeeded" message
- [ ] ✅ Note deployment URL: `https://your-app.onrender.com`

### 🧪 Post-Deployment Testing
- [ ] ✅ Application loads without errors
- [ ] ✅ Wallet connection button appears
- [ ] ✅ MetaMask connection works
- [ ] ✅ Network detection works (Etherlink Mainnet)
- [ ] ✅ Smart contract interactions function
- [ ] ✅ Game creation works
- [ ] ✅ Betting system operational
- [ ] ✅ AI narratives generate (if OpenAI configured)
- [ ] ✅ Results display correctly

### 🔍 Browser Console Check
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ Network requests succeed
- [ ] ✅ Blockchain connections established
- [ ] ✅ Environment variables loaded
- [ ] ✅ Smart contract addresses correct

## 🎮 Functional Testing

### 💰 Wallet & Blockchain
- [ ] ✅ MetaMask connects successfully
- [ ] ✅ Correct network detected (Chain ID: 42793)
- [ ] ✅ Balance displays correctly
- [ ] ✅ Network switching works (if needed)

### 🎯 Game Functionality
- [ ] ✅ Game creation succeeds
- [ ] ✅ Contestant selection works
- [ ] ✅ Betting modal opens
- [ ] ✅ Bet placement succeeds
- [ ] ✅ Transaction confirmations work
- [ ] ✅ Game simulation runs
- [ ] ✅ Results display correctly
- [ ] ✅ Payouts process (if applicable)

### 🤖 AI Features
- [ ] ✅ AI narratives generate (if OpenAI key set)
- [ ] ✅ Narratives display properly
- [ ] ✅ Fallback narratives work (if no OpenAI key)
- [ ] ✅ Story progression logical

## 🔧 Performance & Optimization

### ⚡ Performance Checks
- [ ] ✅ Page load time < 3 seconds
- [ ] ✅ Wallet connection < 2 seconds
- [ ] ✅ Game creation < 10 seconds
- [ ] ✅ No memory leaks in browser
- [ ] ✅ Mobile responsive design

### 📊 Monitoring Setup
- [ ] ✅ Render dashboard metrics enabled
- [ ] ✅ Error tracking configured
- [ ] ✅ Performance monitoring active
- [ ] ✅ Uptime monitoring set

## 🛡️ Security Verification

### 🔐 Security Checks
- [ ] ✅ HTTPS enabled (automatic on Render)
- [ ] ✅ No sensitive data exposed in frontend
- [ ] ✅ Environment variables secure
- [ ] ✅ API keys not visible in browser
- [ ] ✅ Smart contract addresses verified

### 🔍 Final Security Scan
- [ ] ✅ Run security check: `npm run security-check`
- [ ] ✅ No exposed secrets in deployed code
- [ ] ✅ Browser dev tools show no sensitive data
- [ ] ✅ Network tab shows no exposed keys

## 🎉 Go-Live Checklist

### 📢 Launch Preparation
- [ ] ✅ All tests passing
- [ ] ✅ Performance acceptable
- [ ] ✅ Security verified
- [ ] ✅ Monitoring active
- [ ] ✅ Backup plan ready

### 🚀 Launch
- [ ] ✅ Application publicly accessible
- [ ] ✅ Share URL with users
- [ ] ✅ Monitor initial usage
- [ ] ✅ Watch for errors/issues
- [ ] ✅ Celebrate successful deployment! 🎊

## 📞 Troubleshooting

### Common Issues & Solutions
- **Build Fails**: Check package.json scripts and dependencies
- **Environment Variables**: Ensure VITE_ prefix for frontend vars
- **Wallet Issues**: Verify network configuration and RPC URLs
- **Smart Contract Errors**: Check contract addresses and network
- **API Errors**: Verify OpenAI API key and rate limits

### 🆘 Getting Help
- **Render Support**: https://render.com/docs
- **GitHub Issues**: Create issues in your repository
- **Community**: Render Discord/forums

---

## 🎯 Quick Deploy Commands

```bash
# Final pre-deployment check
npm run security-check
npm run build
npm run preview

# Push to trigger deployment
git add .
git commit -m "🚀 Ready for production deployment"
git push origin main
```

**🎮 Your Squid Game is ready to go live on Render!** 🚀

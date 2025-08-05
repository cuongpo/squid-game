# 🚀 Deploy Squid Game to Render - Complete Guide

This guide will walk you through deploying your blockchain Squid Game application to Render.com for production use.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ GitHub repository: https://github.com/cuongpo/squid-game.git
- ✅ Render account (free): https://render.com
- ✅ OpenAI API key for AI narratives
- ✅ Smart contracts deployed on Etherlink Mainnet

## 🎯 Step 1: Prepare Your Repository

### 1.1 Verify Build Configuration
Your project should already have the correct build setup:

```json
// package.json (already configured)
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.2 Create Render Build Script
Create a build script that Render will use:

```bash
# This is already handled by your existing build command
npm run build
```

## 🌐 Step 2: Create Render Web Service

### 2.1 Sign Up/Login to Render
1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### 2.2 Create New Web Service
1. Click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: `cuongpo/squid-game`
4. Click **"Connect"**

### 2.3 Configure Service Settings
Fill in the following settings:

**Basic Settings:**
- **Name**: `squid-game-blockchain`
- **Region**: `Oregon (US West)` or closest to your users
- **Branch**: `main`
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Publish Directory**: Leave empty (not needed for Node.js apps)

**Instance Type:**
- **Free Tier**: Select "Free" (sufficient for testing)
- **Paid Tier**: Select "Starter" ($7/month) for better performance

## 🔐 Step 3: Configure Environment Variables

### 3.1 Add Environment Variables
In the Render dashboard, go to **Environment** tab and add:

```bash
# Network Configuration
VITE_NETWORK=mainnet

# OpenAI Configuration (REQUIRED)
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Optional: Thirdweb (if using)
VITE_THIRDWEB_API_KEY=your-thirdweb-key-here
```

### 3.2 Important Notes
- ⚠️ **Never add PRIVATE_KEY** to Render environment variables
- ✅ Only add frontend environment variables (VITE_ prefixed)
- 🔒 PRIVATE_KEY is only needed for smart contract deployment (local only)

## 🛠️ Step 4: Deploy Application

### 4.1 Start Deployment
1. Click **"Create Web Service"**
2. Render will automatically start building your application
3. Monitor the build logs in real-time

### 4.2 Build Process
You'll see logs similar to:
```bash
==> Cloning from https://github.com/cuongpo/squid-game...
==> Running build command 'npm install && npm run build'...
==> Installing dependencies...
==> Building React application...
==> Build completed successfully
==> Starting application with 'npm run preview'...
```

### 4.3 Deployment Complete
- Build time: ~3-5 minutes
- Your app will be available at: `https://squid-game-blockchain.onrender.com`

## 🔧 Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain: `squidgame.yourdomain.com`
4. Follow DNS configuration instructions

### 5.2 SSL Certificate
- Render automatically provides free SSL certificates
- HTTPS is enabled by default

## ✅ Step 6: Verify Deployment

### 6.1 Test Application
Visit your deployed URL and verify:
- ✅ Application loads correctly
- ✅ Wallet connection works
- ✅ Smart contract interactions function
- ✅ AI narratives generate (if OpenAI key configured)
- ✅ Betting system operates properly

### 6.2 Check Browser Console
Open browser dev tools and verify:
- ✅ No JavaScript errors
- ✅ Network requests succeed
- ✅ Blockchain connections work
- ✅ Environment variables loaded correctly

## 🚀 Step 7: Production Optimizations

### 7.1 Performance Settings
Consider upgrading to paid plan for:
- **Faster builds**: Reduced deployment time
- **Better performance**: More CPU/memory
- **Custom domains**: Professional appearance
- **Analytics**: Usage monitoring

### 7.2 Monitoring
Set up monitoring:
- **Render Dashboard**: Built-in metrics
- **Error Tracking**: Monitor application errors
- **Performance**: Track load times and usage

## 🔄 Step 8: Continuous Deployment

### 8.1 Auto-Deploy Setup
Render automatically deploys when you push to `main` branch:
```bash
# Make changes locally
git add .
git commit -m "Update application"
git push origin main

# Render automatically detects and deploys
```

### 8.2 Deploy Branches
You can also deploy specific branches:
- Create branch-specific services for staging
- Test features before merging to main

## 🛡️ Step 9: Security & Best Practices

### 9.1 Environment Security
- ✅ Only expose necessary environment variables
- ✅ Use VITE_ prefix for frontend variables
- ✅ Never commit API keys to repository
- ✅ Rotate API keys regularly

### 9.2 Application Security
- ✅ HTTPS enabled by default
- ✅ Secure headers configured
- ✅ Content Security Policy
- ✅ Regular dependency updates

## 📊 Step 10: Monitoring & Maintenance

### 10.1 Monitor Application
- **Render Metrics**: CPU, memory, response times
- **Error Logs**: Check for runtime errors
- **User Analytics**: Track usage patterns
- **Blockchain Metrics**: Monitor transaction success rates

### 10.2 Regular Updates
- Update dependencies regularly
- Monitor for security vulnerabilities
- Keep smart contract addresses current
- Update API keys as needed

## 🎉 Deployment Complete!

Your Squid Game blockchain application is now live on Render!

**🔗 Your Live Application:**
- **URL**: `https://your-app-name.onrender.com`
- **Features**: Full blockchain betting with XTZ
- **AI Narratives**: OpenAI-powered storytelling
- **Smart Contracts**: Connected to Etherlink Mainnet
- **Wallet Integration**: MetaMask support

## 📞 Support & Troubleshooting

### Common Issues:
1. **Build Fails**: Check package.json scripts
2. **Environment Variables**: Verify VITE_ prefix
3. **Wallet Connection**: Ensure correct network configuration
4. **API Errors**: Verify OpenAI API key

### Getting Help:
- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Create issues in your repository
- **Community**: Render community forums

---

**🎮 Your blockchain Squid Game is now live and ready for players worldwide!** 🚀

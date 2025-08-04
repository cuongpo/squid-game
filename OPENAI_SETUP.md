# 🤖 OpenAI Integration Setup Guide

## ✨ What This Adds

Your Squid Game Simulator now supports **AI-powered dynamic narratives** using OpenAI! This creates:

- **Personalized storytelling** that adapts to your specific contestants
- **Dramatic elimination descriptions** based on contestant personalities
- **Engaging round narratives** that feel unique every time
- **Immersive Squid Game atmosphere** with professional-quality writing

## 🚀 Quick Setup (Optional)

### **Option 1: Use Enhanced Static Narratives (Default)**
- ✅ **No setup required** - works out of the box
- ✅ **Enhanced narratives** with contestant personalization
- ✅ **Round-specific storytelling** for each game type
- ✅ **Completely free** - no API costs

### **Option 2: Enable AI-Powered Narratives**

1. **Get an OpenAI API Key**
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Configure the Environment**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and replace with your actual key
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

4. **Verify Setup**
   - Look for "✨ AI-powered narratives enabled" on the intro screen
   - Start a game and watch for dynamic narratives!

## 💰 Cost Information

- **Enhanced Static Narratives**: **FREE** (default)
- **AI-Powered Narratives**: ~$0.001-0.002 per round (very affordable)
- **Example**: Playing 10 complete games ≈ $0.05-0.10 total

## 🎮 How It Works

### **Without OpenAI (Default)**
```
Round 1: Red Light, Green Light
The massive doll towers over the playground...
[Enhanced static narratives with contestant personalization]
```

### **With OpenAI Enabled**
```
Round 1: Red Light, Green Light
The colossal doll's mechanical eyes sweep across the field like searchlights of death...
[Unique AI-generated narratives every time]
```

## 🔧 Technical Details

### **Fallback System**
- If OpenAI fails or isn't configured, automatically uses enhanced static narratives
- No interruption to gameplay
- Graceful degradation ensures the game always works

### **Security**
- API key stored in environment variables
- Not exposed in the browser console
- Only used for narrative generation

### **Performance**
- Narratives generated asynchronously
- Game continues while AI processes
- Fallback ensures no delays

## 🎯 Status Indicator

The game shows your current narrative mode:

- **✨ AI-powered narratives enabled** - OpenAI is working
- **📄 Using enhanced static narratives** - Default mode (still great!)

## 🛠️ Troubleshooting

### **"Using enhanced static narratives" shows instead of AI**
1. Check your `.env` file exists and has the correct key
2. Restart the development server: `npm run dev`
3. Verify the API key is valid at [platform.openai.com](https://platform.openai.com)

### **API errors in console**
- Check your OpenAI account has credits
- Verify the API key hasn't expired
- Game will automatically fall back to enhanced static narratives

### **Want to disable AI temporarily**
- Remove or comment out the `VITE_OPENAI_API_KEY` line in `.env`
- Restart the server

## 🎉 Benefits Summary

### **Enhanced Static Narratives (Default)**
- ✅ Personalized to contestant personalities
- ✅ Round-specific storytelling
- ✅ Dramatic elimination descriptions
- ✅ Completely free
- ✅ Always available

### **AI-Powered Narratives (Optional)**
- ✅ All the above benefits PLUS:
- ✅ Unique stories every playthrough
- ✅ More creative and varied language
- ✅ Adaptive storytelling based on game state
- ✅ Professional-quality dramatic writing

## 🚀 Ready to Play!

Your game now has enhanced narratives either way! 

- **No setup needed** - enhanced static narratives work great
- **Want AI magic?** - Follow the 3-step setup above
- **Either way** - you get dramatically improved storytelling!

Start playing and experience the enhanced Squid Game narrative system! 🎮✨

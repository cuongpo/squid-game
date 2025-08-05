#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * 
 * Validates that the application is ready for deployment to Render
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing Squid Game for Render Deployment');
console.log('=' .repeat(50));

let allChecksPass = true;

function runCheck(description, checkFn) {
  try {
    console.log(`\n🔍 ${description}...`);
    const result = checkFn();
    if (result === true) {
      console.log(`✅ ${description} - PASSED`);
    } else if (typeof result === 'string') {
      console.log(`✅ ${description} - ${result}`);
    }
    return true;
  } catch (error) {
    console.log(`❌ ${description} - FAILED: ${error.message}`);
    allChecksPass = false;
    return false;
  }
}

// Check 1: Verify package.json has correct scripts
runCheck('Checking package.json scripts', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts.build) {
    throw new Error('Missing build script');
  }
  
  if (!packageJson.scripts.preview) {
    throw new Error('Missing preview script');
  }
  
  if (packageJson.scripts.build !== 'tsc -b && vite build') {
    throw new Error('Build script should be "tsc -b && vite build"');
  }
  
  return 'Build and preview scripts configured correctly';
});

// Check 2: Verify build works
runCheck('Testing build process', () => {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check if dist folder exists
    if (!fs.existsSync('dist')) {
      throw new Error('Build did not create dist folder');
    }
    
    // Check if index.html exists in dist
    if (!fs.existsSync('dist/index.html')) {
      throw new Error('Build did not create dist/index.html');
    }
    
    return 'Build completed successfully';
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
});

// Check 3: Verify blockchain configuration
runCheck('Checking blockchain configuration', () => {
  const blockchainConfig = fs.readFileSync('src/config/blockchain.ts', 'utf8');
  
  if (!blockchainConfig.includes('42793')) {
    throw new Error('Etherlink Mainnet chain ID (42793) not found');
  }
  
  if (!blockchainConfig.includes('https://node.mainnet.etherlink.com')) {
    throw new Error('Etherlink Mainnet RPC URL not found');
  }
  
  if (!blockchainConfig.includes('0xd4A5e748a5fa8Fc3a33a2BFAcE90283d92749C99')) {
    throw new Error('Game contract address not found');
  }
  
  return 'Blockchain configuration looks correct';
});

// Check 4: Verify environment configuration
runCheck('Checking environment configuration', () => {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  if (!envExample.includes('VITE_NETWORK')) {
    throw new Error('VITE_NETWORK not found in .env.example');
  }
  
  if (!envExample.includes('VITE_OPENAI_API_KEY')) {
    throw new Error('VITE_OPENAI_API_KEY not found in .env.example');
  }
  
  return 'Environment variables properly configured';
});

// Check 5: Security check
runCheck('Running security check', () => {
  try {
    execSync('npm run security-check', { stdio: 'pipe' });
    return 'Security check passed';
  } catch (error) {
    throw new Error('Security check failed - fix issues before deploying');
  }
});

// Check 6: Verify git status
runCheck('Checking git status', () => {
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim()) {
      console.log('⚠️  Uncommitted changes found:');
      console.log(gitStatus);
      return 'Uncommitted changes - consider committing before deploy';
    }
    
    return 'Git working directory clean';
  } catch (error) {
    return 'Git status check skipped (not a git repository)';
  }
});

// Check 7: Verify render.yaml exists
runCheck('Checking Render configuration', () => {
  if (!fs.existsSync('render.yaml')) {
    throw new Error('render.yaml not found - this helps with deployment');
  }
  
  const renderConfig = fs.readFileSync('render.yaml', 'utf8');
  
  if (!renderConfig.includes('npm run build')) {
    throw new Error('render.yaml missing build command');
  }
  
  if (!renderConfig.includes('npm run preview')) {
    throw new Error('render.yaml missing start command');
  }
  
  return 'Render configuration file ready';
});

// Summary
console.log('\n' + '=' .repeat(50));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('=' .repeat(50));

if (allChecksPass) {
  console.log('🎉 ALL CHECKS PASSED! Your application is ready for deployment.');
  console.log('\n🚀 Next Steps:');
  console.log('1. Go to https://render.com');
  console.log('2. Create a new Web Service');
  console.log('3. Connect your GitHub repository: cuongpo/squid-game');
  console.log('4. Use these settings:');
  console.log('   - Build Command: npm install && npm run build');
  console.log('   - Start Command: npm run preview');
  console.log('   - Publish Directory: dist');
  console.log('5. Add environment variables:');
  console.log('   - VITE_NETWORK=mainnet');
  console.log('   - VITE_OPENAI_API_KEY=your-openai-key');
  console.log('\n📚 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions');
  
} else {
  console.log('❌ SOME CHECKS FAILED! Please fix the issues above before deploying.');
  console.log('\n🔧 Common fixes:');
  console.log('- Run: npm install');
  console.log('- Fix TypeScript errors');
  console.log('- Run: npm run security-check');
  console.log('- Commit your changes: git add . && git commit -m "Ready for deployment"');
}

console.log('\n🎮 Happy deploying! Your Squid Game will be live soon! 🚀');

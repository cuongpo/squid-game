#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * Validates that sensitive information is properly protected and not exposed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔒 Security Check - Validating Sensitive Information Protection');
console.log('=' .repeat(70));

// Patterns that should never be committed
const DANGEROUS_PATTERNS = [
  // Private keys
  /PRIVATE_KEY\s*=\s*[a-fA-F0-9]{64}/,
  /private.*key.*[a-fA-F0-9]{64}/i,
  
  // OpenAI API keys
  /VITE_OPENAI_API_KEY\s*=\s*sk-[a-zA-Z0-9]{48}/,
  /openai.*api.*key.*sk-[a-zA-Z0-9]{48}/i,
  
  // Thirdweb API keys
  /VITE_THIRDWEB_API_KEY\s*=\s*[a-zA-Z0-9]{32,}/,
  
  // Generic secrets
  /secret.*[a-zA-Z0-9]{20,}/i,
  /password.*[a-zA-Z0-9]{8,}/i,
  /token.*[a-zA-Z0-9]{20,}/i,
];

// Files to check for exposed secrets
const FILES_TO_CHECK = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
  'contracts/**/*.sol',
  'scripts/**/*.js',
  'README.md',
  'package.json',
  'hardhat.config.cjs',
  '.env.example'
];

// Files that should be ignored by git
const SHOULD_BE_GITIGNORED = [
  '.env',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local',
  'private-key.txt',
  'mnemonic.txt',
  'seed.txt',
  'wallet.json',
  'openai-key.txt',
  'api-keys.txt',
  'secrets.json'
];

function checkGitignore() {
  console.log('\n📋 Checking .gitignore file...');
  
  try {
    const gitignorePath = path.join(projectRoot, '.gitignore');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    let allProtected = true;
    
    SHOULD_BE_GITIGNORED.forEach(file => {
      if (gitignoreContent.includes(file)) {
        console.log(`✅ ${file} is properly ignored`);
      } else {
        console.log(`⚠️  ${file} should be added to .gitignore`);
        allProtected = false;
      }
    });
    
    if (allProtected) {
      console.log('✅ All sensitive files are properly protected in .gitignore');
    }
    
    return allProtected;
    
  } catch (error) {
    console.log('❌ Could not read .gitignore file');
    return false;
  }
}

function checkForExposedSecrets() {
  console.log('\n🔍 Scanning for exposed secrets in source files...');
  
  const filesToScan = [
    'src/config/blockchain.ts',
    'src/services/openaiNarrative.ts',
    'README.md',
    'package.json',
    'hardhat.config.cjs'
  ];
  
  let foundSecrets = false;
  
  filesToScan.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      DANGEROUS_PATTERNS.forEach((pattern, index) => {
        if (pattern.test(content)) {
          console.log(`❌ DANGER: Potential secret found in ${filePath}`);
          console.log(`   Pattern ${index + 1}: ${pattern}`);
          foundSecrets = true;
        }
      });
      
      if (!foundSecrets) {
        console.log(`✅ ${filePath} - No exposed secrets found`);
      }
    }
  });
  
  if (!foundSecrets) {
    console.log('✅ No exposed secrets found in source files');
  }
  
  return !foundSecrets;
}

function checkEnvExample() {
  console.log('\n📝 Checking .env.example file...');
  
  try {
    const envExamplePath = path.join(projectRoot, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    
    // Check that example values are placeholders, not real keys
    const hasPlaceholders = content.includes('your_openai_api_key_here') && 
                           content.includes('your_64_character_private_key_without_0x_prefix');
    
    if (hasPlaceholders) {
      console.log('✅ .env.example contains safe placeholder values');
      return true;
    } else {
      console.log('⚠️  .env.example might contain real values instead of placeholders');
      return false;
    }
    
  } catch (error) {
    console.log('⚠️  .env.example file not found');
    return false;
  }
}

function checkActualEnvFile() {
  console.log('\n🔐 Checking for .env file...');
  
  const envPath = path.join(projectRoot, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists (good for development)');
    console.log('⚠️  Make sure .env is in .gitignore and never committed!');
    
    // Check if .env is properly gitignored
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env')) {
        console.log('✅ .env is properly protected by .gitignore');
        return true;
      } else {
        console.log('❌ CRITICAL: .env exists but is NOT in .gitignore!');
        return false;
      }
    }
  } else {
    console.log('ℹ️  No .env file found (using environment variables or defaults)');
    return true;
  }
}

function printSecurityGuidelines() {
  console.log('\n📚 Security Best Practices:');
  console.log('');
  console.log('🔐 Private Keys:');
  console.log('  • Never commit private keys to git');
  console.log('  • Use environment variables (.env file)');
  console.log('  • Keep .env in .gitignore');
  console.log('  • Use different keys for testnet/mainnet');
  console.log('');
  console.log('🤖 API Keys:');
  console.log('  • Store OpenAI keys in .env file');
  console.log('  • Consider using backend proxy in production');
  console.log('  • Monitor API usage and costs');
  console.log('  • Rotate keys periodically');
  console.log('');
  console.log('🔒 General Security:');
  console.log('  • Regular security audits');
  console.log('  • Keep dependencies updated');
  console.log('  • Use HTTPS in production');
  console.log('  • Implement rate limiting');
}

function printSummary(gitignoreOk, noSecretsExposed, envExampleOk, envFileOk) {
  console.log('\n📊 Security Check Summary:');
  console.log('=' .repeat(40));
  
  const allGood = gitignoreOk && noSecretsExposed && envExampleOk && envFileOk;
  
  if (allGood) {
    console.log('🎉 SECURITY CHECK PASSED!');
    console.log('✅ All sensitive information is properly protected');
    console.log('✅ No secrets exposed in source code');
    console.log('✅ .gitignore is comprehensive');
    console.log('✅ Environment configuration is secure');
  } else {
    console.log('⚠️  SECURITY ISSUES DETECTED!');
    console.log('Please review the warnings above and fix any issues.');
  }
  
  return allGood;
}

// Run security check
async function main() {
  try {
    const gitignoreOk = checkGitignore();
    const noSecretsExposed = checkForExposedSecrets();
    const envExampleOk = checkEnvExample();
    const envFileOk = checkActualEnvFile();
    
    printSecurityGuidelines();
    const allSecure = printSummary(gitignoreOk, noSecretsExposed, envExampleOk, envFileOk);
    
    if (allSecure) {
      console.log('\n🚀 Your project is secure and ready for production!');
    } else {
      console.log('\n🔧 Please address the security issues before deploying.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Security check failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

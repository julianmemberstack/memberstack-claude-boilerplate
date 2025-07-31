#!/usr/bin/env node

/**
 * Reset Setup Script
 * 
 * This script resets the project to a clean state, removing all configuration
 * files so you can start the setup process over again.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const emojis = {
  warning: '⚠️',
  success: '✅',
  info: 'ℹ️',
  trash: '🗑️',
  reset: '🔄',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${emojis.warning} ${message}`, colors.yellow);
}

function logSuccess(message) {
  log(`${emojis.success} ${message}`, colors.green);
}

function logInfo(message) {
  log(`${emojis.info} ${message}`, colors.blue);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${prompt}${colors.reset}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function resetSetup() {
  console.clear();
  
  log(`${colors.bright}${colors.red}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║      ${emojis.reset} Reset Memberstack Boilerplate Setup ${emojis.reset}      ║
║                                                          ║
║           This will remove all configuration            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log('');
  
  logWarning('This will remove the following files and configurations:');
  console.log('');
  
  const filesToRemove = [
    '.env.local',
    'lib/auth-config.ts (if auto-generated)'
  ];
  
  // Check which files exist
  const existingFiles = [];
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    existingFiles.push('.env.local');
  }
  
  const authConfigPath = path.join(process.cwd(), 'lib', 'auth-config.ts');
  if (fs.existsSync(authConfigPath)) {
    try {
      const content = fs.readFileSync(authConfigPath, 'utf8');
      if (content.includes('Auto-generated Authentication')) {
        existingFiles.push('lib/auth-config.ts (auto-generated)');
      } else {
        log(`${emojis.info} lib/auth-config.ts exists but appears to be manually created - will not remove`, colors.blue);
      }
    } catch (error) {
      // Ignore read errors
    }
  }
  
  if (existingFiles.length === 0) {
    logInfo('No configuration files found - project is already clean!');
    logInfo('You can run "npm run setup" to configure the project.');
    rl.close();
    return;
  }
  
  log('Files that will be removed:');
  existingFiles.forEach(file => {
    log(`  ${emojis.trash} ${file}`, colors.red);
  });
  
  console.log('');
  logWarning('This action cannot be undone!');
  
  const confirm = await question('Are you sure you want to reset the setup? (y/N): ');
  
  if (confirm.toLowerCase() !== 'y') {
    logInfo('Reset cancelled.');
    rl.close();
    return;
  }
  
  console.log('');
  logInfo('Resetting setup...');
  
  let removedCount = 0;
  
  // Remove .env.local
  if (fs.existsSync(envPath)) {
    try {
      fs.unlinkSync(envPath);
      logSuccess('Removed .env.local');
      removedCount++;
    } catch (error) {
      log(`${emojis.warning} Failed to remove .env.local: ${error.message}`, colors.yellow);
    }
  }
  
  // Remove auto-generated auth config
  if (fs.existsSync(authConfigPath)) {
    try {
      const content = fs.readFileSync(authConfigPath, 'utf8');
      if (content.includes('Auto-generated Authentication')) {
        fs.unlinkSync(authConfigPath);
        logSuccess('Removed auto-generated auth-config.ts');
        removedCount++;
      }
    } catch (error) {
      log(`${emojis.warning} Failed to check/remove auth-config.ts: ${error.message}`, colors.yellow);
    }
  }
  
  console.log('');
  
  if (removedCount > 0) {
    logSuccess(`Reset complete! Removed ${removedCount} file(s).`);
  } else {
    logInfo('No files were removed.');
  }
  
  console.log('');
  logInfo('Next steps:');
  log(`1. Run ${colors.cyan}npm run setup${colors.reset} to reconfigure the project`);
  log(`2. Or manually create .env.local with your Memberstack keys`);
  console.log('');
  
  rl.close();
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.log('');
  log(`${emojis.warning} Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  logInfo('Reset cancelled by user.');
  process.exit(0);
});

// Run the reset
resetSetup().catch((error) => {
  log(`${emojis.warning} Reset failed: ${error.message}`, colors.red);
  process.exit(1);
});
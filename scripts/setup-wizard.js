#!/usr/bin/env node

/**
 * Interactive Setup Wizard for Memberstack Claude Boilerplate
 * 
 * This wizard guides users through the initial setup process step-by-step,
 * making it impossible to miss crucial configuration steps.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Emojis for better UX
const emojis = {
  rocket: '🚀',
  check: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  key: '🔑',
  magic: '✨',
  party: '🎉',
  book: '📚',
  gear: '⚙️',
  shield: '🔒',
};

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('');
  log('═'.repeat(60), colors.cyan);
  log(`${emojis.rocket} ${message}`, colors.bright + colors.cyan);
  log('═'.repeat(60), colors.cyan);
  console.log('');
}

function logSuccess(message) {
  log(`${emojis.check} ${message}`, colors.green);
}

function logWarning(message) {
  log(`${emojis.warning} ${message}`, colors.yellow);
}

function logError(message) {
  log(`${emojis.error} ${message}`, colors.red);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if .env.local exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  return fs.existsSync(envPath);
}

// Check if dependencies are installed
function checkDependencies() {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  return fs.existsSync(nodeModulesPath);
}

// Create .env.local file with safety checks
function createEnvFile(publicKey) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    // Check if we can write to the current directory
    const testPath = path.join(process.cwd(), '.write-test');
    try {
      fs.writeFileSync(testPath, 'test');
      fs.unlinkSync(testPath);
    } catch (error) {
      throw new Error(`Cannot write to current directory. ${error.message}`);
    }
    
    // Check if .env.local already exists and is writable
    if (fs.existsSync(envPath)) {
      try {
        fs.accessSync(envPath, fs.constants.W_OK);
      } catch (error) {
        throw new Error(`Cannot overwrite existing .env.local file. Please check file permissions.`);
      }
    }
    
    const envContent = `# Memberstack Configuration
# Get your keys from https://app.memberstack.com/dashboard
NEXT_PUBLIC_MEMBERSTACK_KEY=${publicKey}

# Optional: Add secret key later for server-side operations
# MEMBERSTACK_SECRET_KEY=sk_your_secret_key_here

# Environment
NODE_ENV=development

# Optional: Custom domain for Memberstack API (if using custom domain)
# NEXT_PUBLIC_MEMBERSTACK_DOMAIN=your-custom-domain.com
`;

    fs.writeFileSync(envPath, envContent);
    
    // Verify the file was written correctly
    const writtenContent = fs.readFileSync(envPath, 'utf8');
    if (!writtenContent.includes(publicKey)) {
      throw new Error('File was created but public key was not written correctly');
    }
    
    logSuccess('.env.local file created successfully!');
    
  } catch (error) {
    logError(`Failed to create .env.local file: ${error.message}`);
    logInfo('Manual solution:');
    log('1. Create a file named ".env.local" in your project root');
    log('2. Add the following content:');
    log('');
    log(`NEXT_PUBLIC_MEMBERSTACK_KEY=${publicKey}`);
    log('');
    throw error;
  }
}

// Validate Memberstack public key format
function validatePublicKey(publicKey) {
  const errors = [];
  const warnings = [];
  
  // Public key validation
  if (!publicKey || publicKey.trim() === '') {
    errors.push('Public key is required');
  } else if (!publicKey.startsWith('pk_')) {
    errors.push('Public key must start with "pk_" (you entered: ' + publicKey.substring(0, 10) + '...)');
  } else if (publicKey.length < 20) {
    errors.push('Public key is too short (should be at least 20 characters)');
  } else if (publicKey.length > 200) {
    errors.push('Public key is too long (might include extra characters)');
  } else if (!/^pk_[a-zA-Z0-9_]+$/.test(publicKey)) {
    errors.push('Public key contains invalid characters (should only contain letters, numbers, and underscores)');
  }
  
  if (publicKey && publicKey.includes(' ')) {
    warnings.push('Public key contains spaces - this might cause issues');
  }
  
  return { errors, warnings };
}

// Test Memberstack connection using DOM package
async function testMemberstackConnection(publicKey, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logInfo(`Testing connection (attempt ${attempt}/${maxRetries})...`);
      
      // Mock browser environment for DOM package
      if (typeof global !== 'undefined' && !global.window) {
        global.window = {};
        global.document = {};
        global.localStorage = {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {}
        };
        global.sessionStorage = global.localStorage;
      }
      
      // Import Memberstack DOM package dynamically
      const memberstack = await import('@memberstack/dom');
      
      // Initialize with public key only
      const ms = memberstack.default.init({ publicKey });
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Test connection by getting app info
      const appResult = await Promise.race([
        ms.getApp(),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Connection timeout'));
          });
        })
      ]);
      
      clearTimeout(timeoutId);
      
      if (appResult.data) {
        const app = appResult.data;
        const planCount = app.plans?.length || 0;
        return { 
          success: true, 
          planCount,
          appMode: app.mode,
          appName: app.name
        };
      } else {
        return { success: false, error: 'No app data returned', code: 'NO_DATA' };
      }
    } catch (error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        if (attempt < maxRetries) {
          logWarning(`Connection timeout. Retrying...`);
          continue;
        }
        return { success: false, error: 'Connection timeout after 15 seconds', code: 'TIMEOUT' };
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return { success: false, error: 'Invalid public key (401 Unauthorized)', code: 401 };
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return { success: false, error: 'Public key lacks required permissions (403 Forbidden)', code: 403 };
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        if (attempt < maxRetries) {
          logWarning(`Rate limited. Waiting 2 seconds before retry...`);
          await sleep(2000);
          continue;
        }
        return { success: false, error: 'Too many requests (429 Rate Limited)', code: 429 };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        if (attempt < maxRetries) {
          logWarning(`Network error. Retrying in 1 second...`);
          await sleep(1000);
          continue;
        }
        return { success: false, error: 'Network connection failed. Check your internet connection.', code: 'NETWORK' };
      } else {
        return { success: false, error: error.message, code: 'UNKNOWN' };
      }
    }
  }
  
  return { success: false, error: 'All connection attempts failed', code: 'MAX_RETRIES' };
}

// Enhanced setup state detection
async function checkSetupState() {
  const state = {
    hasEnvFile: false,
    hasValidKeys: false,
    hasWorkingConnection: false,
    hasAuthConfig: false,
    issues: [],
    status: 'not_configured'
  };
  
  // Check .env.local file
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    state.issues.push('Missing .env.local file');
    return state;
  }
  
  state.hasEnvFile = true;
  
  // Check environment variables
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const publicKeyMatch = envContent.match(/NEXT_PUBLIC_MEMBERSTACK_KEY=(.+)/);
    
    const publicKey = publicKeyMatch ? publicKeyMatch[1].trim() : '';
    
    if (!publicKey || !publicKey.startsWith('pk_')) {
      state.issues.push('Invalid or missing public key');
    }
    
    if (publicKey.startsWith('pk_')) {
      state.hasValidKeys = true;
      
      // Test connection quickly
      try {
        const testResult = await testMemberstackConnection(publicKey, 1); // Single attempt
        if (testResult.success) {
          state.hasWorkingConnection = true;
        } else {
          state.issues.push(`Connection issue: ${testResult.error}`);
        }
      } catch (error) {
        state.issues.push('Failed to test connection');
      }
    }
  } catch (error) {
    state.issues.push('Cannot read .env.local file');
    return state;
  }
  
  // Check auth config
  const authConfigPath = path.join(process.cwd(), 'lib', 'auth-config.ts');
  if (fs.existsSync(authConfigPath)) {
    state.hasAuthConfig = true;
  }
  
  // Determine overall status
  if (state.hasValidKeys && state.hasWorkingConnection) {
    state.status = 'fully_configured';
  } else if (state.hasValidKeys) {
    state.status = 'partially_configured';
  } else if (state.hasEnvFile) {
    state.status = 'needs_keys';
  } else {
    state.status = 'not_configured';
  }
  
  return state;
}

// Main setup wizard
async function runSetupWizard() {
  console.clear();
  
  // Check current setup state
  logInfo('Checking current setup state...');
  const setupState = await checkSetupState();
  
  if (setupState.status === 'fully_configured') {
    logSuccess('Your project is fully configured and working!');
    log('');
    log(`Run ${colors.cyan}npm run dev${colors.reset} to start the development server.`);
    log(`Run ${colors.cyan}npm run setup:memberstack${colors.reset} to update your plan configuration.`);
    log(`Run ${colors.cyan}npm run setup:reset${colors.reset} to reset and start over.`);
    log('');
    const reconfigure = await question('Do you want to run setup again anyway? (y/N): ');
    
    if (reconfigure.toLowerCase() !== 'y') {
      rl.close();
      return;
    }
  } else if (setupState.status === 'partially_configured') {
    logWarning('Your project is partially configured but has issues:');
    setupState.issues.forEach(issue => log(`  - ${issue}`, colors.yellow));
    log('');
    
    const options = [
      'Fix the current issues',
      'Start over with fresh setup',
      'Continue anyway'
    ];
    
    log('What would you like to do?');
    options.forEach((option, index) => {
      log(`  ${index + 1}. ${option}`);
    });
    
    const choice = await question('Enter your choice (1-3): ');
    
    if (choice === '2') {
      logInfo('Starting fresh setup...');
      // Continue with normal setup flow
    } else if (choice === '3') {
      logInfo('Continuing with existing configuration...');
      rl.close();
      return;
    }
    // Choice 1 or default continues with setup
  } else if (setupState.status === 'needs_keys') {
    logWarning('Environment file exists but needs valid API keys.');
    if (setupState.issues.length > 0) {
      setupState.issues.forEach(issue => log(`  - ${issue}`, colors.yellow));
    }
    log('');
    log('Continuing with key configuration...');
  }
  
  // Welcome message
  log(`
${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     ${emojis.magic} Welcome to Memberstack Claude Boilerplate ${emojis.magic}     ║
║                                                          ║
║        The easiest way to build authenticated apps       ║
║                 with AI-powered development              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`, '');

  await sleep(1000);

  logHeader('Setup Wizard');
  log('This wizard will help you set up your project in less than 60 seconds!');
  log('');
  
  // Step 1: Check dependencies
  logInfo('Checking project dependencies...');
  if (!checkDependencies()) {
    logWarning('Dependencies not installed. Installing now...');
    log('This might take a minute...', colors.dim);
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      logSuccess('Dependencies installed successfully!');
    } catch (error) {
      logError('Failed to install dependencies. Please run "npm install" manually.');
      process.exit(1);
    }
  } else {
    logSuccess('Dependencies already installed!');
  }
  
  console.log('');
  
  // Step 2: Check for existing .env.local
  if (checkEnvFile()) {
    logWarning('.env.local file already exists.');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    
    if (overwrite.toLowerCase() !== 'y') {
      logInfo('Keeping existing configuration. Setup complete!');
      rl.close();
      return;
    }
  }
  
  // Step 3: Get Memberstack public key
  logHeader('Memberstack Configuration');
  
  log(`${emojis.key} You'll need your Memberstack public key to continue.`);
  log('');
  log(`Get it from: ${colors.cyan}https://app.memberstack.com${colors.reset}`);
  log('1. Log in to your Memberstack account');
  log('2. Select your app (or create a new one)');
  log('3. Go to Settings → API Keys');
  log('4. Copy your Public key (starts with pk_)');
  log('');
  log(`${colors.dim}Note: Only the public key is needed for setup. You can add`);
  log(`the secret key later if you need server-side operations.${colors.reset}`);
  log('');
  
  const openBrowser = await question('Would you like to open Memberstack in your browser? (Y/n): ');
  
  if (openBrowser.toLowerCase() !== 'n') {
    try {
      const platform = process.platform;
      const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
      execSync(`${command} https://app.memberstack.com`);
      logSuccess('Opened Memberstack in your browser!');
    } catch (error) {
      logWarning('Could not open browser automatically.');
    }
  }
  
  console.log('');
  
  // Get public key
  let publicKey = '';
  let publicKeyValid = false;
  
  while (!publicKeyValid) {
    publicKey = await question(`${emojis.key} Enter your PUBLIC key (starts with pk_): `);
    
    if (!publicKey) {
      logError('Public key is required!');
      continue;
    }
    
    if (!publicKey.startsWith('pk_')) {
      logError('Public key should start with "pk_"');
      const retry = await question('Try again? (Y/n): ');
      if (retry.toLowerCase() === 'n') {
        process.exit(1);
      }
      continue;
    }
    
    publicKeyValid = true;
  }
  
  console.log('');
  
  // Step 4: Validate public key
  logInfo('Validating your public key...');
  
  const validation = validatePublicKey(publicKey);
  
  if (validation.errors.length > 0) {
    logError('Public key validation failed:');
    validation.errors.forEach(error => log(`  ❌ ${error}`, colors.red));
    log('');
    logInfo('Common solutions:');
    log('  1. Copy public key directly from app.memberstack.com → Settings → API Keys');
    log('  2. Make sure you copied the entire key (no missing characters)');
    log('  3. Check for extra spaces at the beginning or end');
    log('');
    
    const retry = await question('Would you like to enter your key again? (Y/n): ');
    if (retry.toLowerCase() !== 'n') {
      // Go back to key entry
      return runSetupWizard();
    } else {
      logError('Setup cancelled due to invalid key.');
      process.exit(1);
    }
  }
  
  if (validation.warnings.length > 0) {
    logWarning('Public key validation warnings:');
    validation.warnings.forEach(warning => log(`  ⚠️  ${warning}`, colors.yellow));
    
    const proceed = await question('Continue anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      logInfo('Setup cancelled. Please check your key and try again.');
      process.exit(1);
    }
  }
  
  // Test connection
  logInfo('Testing connection to Memberstack...');
  const testResult = await testMemberstackConnection(publicKey);
  
  if (testResult.success) {
    logSuccess(`Connection successful! Found ${testResult.planCount} plan(s) in your account.`);
    if (testResult.appMode) {
      log(`App mode: ${colors.cyan}${testResult.appMode}${colors.reset}`);
    }
    if (testResult.appName) {
      log(`App name: ${colors.cyan}${testResult.appName}${colors.reset}`);
    }
  } else {
    logError(`Connection failed: ${testResult.error}`);
    log('');
    
    // Provide specific guidance based on error type
    if (testResult.code === 401) {
      logInfo('Solutions for invalid API key:');
      log('  1. Double-check your public key in app.memberstack.com → Settings → API Keys');
      log('  2. Make sure you copied the PUBLIC key (starts with pk_)');
      log('  3. Verify the key is for the correct Memberstack app');
    } else if (testResult.code === 403) {
      logInfo('Solutions for permission issues:');
      log('  1. Make sure your public key has the required permissions');
      log('  2. Contact Memberstack support if you think this is an error');
    } else if (testResult.code === 'NETWORK' || testResult.code === 'TIMEOUT') {
      logInfo('Solutions for network issues:');
      log('  1. Check your internet connection');
      log('  2. Try again in a few minutes');
      log('  3. Check if you\'re behind a corporate firewall');
    } else if (testResult.code === 429) {
      logInfo('Rate limit hit:');
      log('  1. Wait a few minutes and try again');
      log('  2. You can continue setup - the connection test will work later');
    } else {
      logInfo('General troubleshooting:');
      log('  1. Check your internet connection');
      log('  2. Verify your public key is correct');
      log('  3. Try again in a few minutes');
    }
    
    log('');
    const proceed = await question('Continue with setup anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      logInfo('Setup cancelled. You can run "npm run setup" again when ready.');
      process.exit(1);
    }
  }
  
  console.log('');
  
  // Step 5: Create .env.local
  logInfo('Creating configuration file...');
  createEnvFile(publicKey);
  
  console.log('');
  
  // Step 6: Run plan setup if connection was successful
  if (testResult.success && testResult.planCount > 0) {
    logHeader('Plan Configuration');
    log('Would you like to automatically configure your authentication');
    log('based on your existing Memberstack plans?');
    log('');
    
    const runPlanSetup = await question('Run automatic plan setup? (Y/n): ');
    
    if (runPlanSetup.toLowerCase() !== 'n') {
      logInfo('Running plan configuration...');
      try {
        execSync('node scripts/setup-memberstack.js', { stdio: 'inherit' });
      } catch (error) {
        logWarning('Plan setup encountered an issue. You can run it later with:');
        log('npm run setup:memberstack', colors.cyan);
      }
    } else {
      logInfo('Skipping plan setup. You can run it later with:');
      log('npm run setup:memberstack', colors.cyan);
    }
  } else if (testResult.planCount === 0) {
    logWarning('No plans found in your Memberstack account.');
    log('Create some plans in Memberstack, then run:', colors.yellow);
    log('npm run setup:memberstack', colors.cyan);
  }
  
  console.log('');
  
  // Final step: Success message
  logHeader(`${emojis.party} Setup Complete! ${emojis.party}`);
  
  log(`${emojis.check} Your project is now configured and ready to use!`);
  log('');
  log('Next steps:', colors.bright);
  log(`1. Start the development server: ${colors.cyan}npm run dev${colors.reset}`);
  log(`2. Open your browser to: ${colors.cyan}http://localhost:3000${colors.reset}`);
  log(`3. Try the authentication demo`);
  log('');
  log(`${emojis.book} Documentation:`, colors.bright);
  log(`- Quick Start Guide: ${colors.cyan}README.md${colors.reset}`);
  log(`- Implementation Guide: ${colors.cyan}.claude/implementation-guide.md${colors.reset}`);
  log(`- Auth Configuration: ${colors.cyan}.claude/auth-config-guide.md${colors.reset}`);
  log('');
  log(`${emojis.magic} Pro tip: Use Claude Code to build features faster!`, colors.magenta);
  log(`Just describe what you want to build and Claude will help.`);
  log('');
  
  rl.close();
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  logError(`Unexpected error: ${error.message}`);
  logInfo('If you need help, please check the troubleshooting guide or open an issue.');
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  logWarning('Setup cancelled by user.');
  process.exit(0);
});

// Run the wizard
runSetupWizard().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});
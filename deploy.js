/**
 * Deployment helper script for Testify
 * 
 * This script helps prepare the project for deployment to Vercel
 * by copying necessary files and setting up the environment.
 */

const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists in tmp for Vercel
function setupUploadsDirectory() {
  console.log('Setting up uploads directory for Vercel...');
  
  // Create /tmp/uploads directory if it doesn't exist
  // Note: This is for local testing, Vercel will handle this in production
  const uploadsDir = path.join('/tmp', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created /tmp/uploads directory');
    } catch (err) {
      console.error('Error creating /tmp/uploads directory:', err);
    }
  }
}

// Check if environment files exist
function checkEnvironmentFiles() {
  console.log('Checking environment files...');
  
  const serverEnvProd = path.join(__dirname, 'server', '.env.production');
  const clientEnvProd = path.join(__dirname, 'client', '.env.production');
  
  if (!fs.existsSync(serverEnvProd)) {
    console.warn('Warning: server/.env.production file not found');
    console.warn('Make sure to set environment variables in Vercel dashboard');
  } else {
    console.log('✓ server/.env.production file found');
  }
  
  if (!fs.existsSync(clientEnvProd)) {
    console.warn('Warning: client/.env.production file not found');
    console.warn('Make sure to set VITE_API_URL in Vercel dashboard');
  } else {
    console.log('✓ client/.env.production file found');
  }
}

// Check if vercel.json exists
function checkVercelConfig() {
  console.log('Checking Vercel configuration...');
  
  const vercelConfig = path.join(__dirname, 'vercel.json');
  
  if (!fs.existsSync(vercelConfig)) {
    console.error('Error: vercel.json file not found');
    console.error('Please create a vercel.json file in the project root');
    process.exit(1);
  } else {
    console.log('✓ vercel.json file found');
  }
}

// Run all checks
function runDeploymentChecks() {
  console.log('Running deployment checks for Testify...');
  console.log('----------------------------------------');
  
  checkVercelConfig();
  checkEnvironmentFiles();
  setupUploadsDirectory();
  
  console.log('----------------------------------------');
  console.log('Deployment checks completed.');
  console.log('Your project is ready to be deployed to Vercel!');
  console.log('Follow the instructions in DEPLOYMENT.md for next steps.');
}

// Run the checks
runDeploymentChecks();

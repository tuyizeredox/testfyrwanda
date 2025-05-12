/**
 * Custom build script for Vercel deployment
 * This script builds the project and then copies index.html to 200.html and 404.html
 * to ensure proper SPA routing on Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

console.log(`${colors.bright}${colors.cyan}Starting build process for Vercel deployment...${colors.reset}`);

try {
  // Step 1: Run the standard build
  console.log(`\n${colors.yellow}Running standard build...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 2: Copy index.html to 200.html and 404.html
  console.log(`\n${colors.yellow}Creating SPA routing files...${colors.reset}`);
  const distDir = path.join(__dirname, 'dist');
  const indexPath = path.join(distDir, 'index.html');
  const html200Path = path.join(distDir, '200.html');
  const html404Path = path.join(distDir, '404.html');
  
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Create 200.html
    fs.writeFileSync(html200Path, indexContent);
    console.log(`Created ${colors.green}200.html${colors.reset}`);
    
    // Create 404.html
    fs.writeFileSync(html404Path, indexContent);
    console.log(`Created ${colors.green}404.html${colors.reset}`);
  } else {
    throw new Error('index.html not found in dist directory');
  }
  
  console.log(`\n${colors.bright}${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`Your app is ready to be deployed to Vercel with proper SPA routing.`);
  
} catch (error) {
  console.error(`\n${colors.bright}\x1b[31mBuild failed:${colors.reset}`, error);
  process.exit(1);
}

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const frontendDir = path.resolve(rootDir, 'frontend');
const frontendDist = path.resolve(frontendDir, 'dist');
const rootDist = path.resolve(rootDir, 'dist');

console.log('=== ZeroTrust Assignment Gateway Production Build ===');
console.log(`Root directory:     ${rootDir}`);
console.log(`Frontend directory: ${frontendDir}`);

// 1. Ensure frontend dependencies are installed
const frontendNodeModules = path.resolve(frontendDir, 'node_modules');
if (!fs.existsSync(frontendNodeModules)) {
  console.log('[1/3] Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
} else {
  console.log('[1/3] Frontend dependencies already installed.');
}

// 2. Execute Vite production build inside frontend/
console.log('[2/3] Executing Vite production build...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

// 3. Ensure root dist/ is populated for Cloudflare Workers static assets
console.log('[3/3] Synchronizing static assets to root dist/...');
if (!fs.existsSync(frontendDist)) {
  console.error(`[build] Error: Expected build output not found at ${frontendDist}`);
  process.exit(1);
}

fs.mkdirSync(rootDist, { recursive: true });
fs.cpSync(frontendDist, rootDist, { recursive: true });

// Verify critical assets
const indexHtml = path.resolve(rootDist, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`[build] Error: index.html was not generated in ${rootDist}`);
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexHtml, 'utf8');
if (htmlContent.includes('/src/main.jsx')) {
  console.error('[build] Error: index.html still references raw JSX source!');
  process.exit(1);
}

console.log('[build] Build verification passed! Production assets ready in ./dist');
console.log(`[build] dist/index.html (${fs.statSync(indexHtml).size} bytes)`);
console.log('=== Build Complete ===');

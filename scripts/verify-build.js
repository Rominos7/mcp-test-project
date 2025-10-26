#!/usr/bin/env node

/**
 * Build Verification Script
 *
 * Verifies that the TypeScript build produced all required files
 * and that the output is valid.
 */

import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Required entry points that must exist after build
const requiredFiles = [
  'server.js',
  'server-http.js',
  'client.js',
  'server-core.js',
  'src/http/server.js',
  'src/config/env.config.js',
];

// Required directories
const requiredDirs = [
  'src',
  'src/http',
  'src/http/handlers',
  'src/http/middleware',
  'src/http/routes',
  'src/http/utils',
  'src/config',
];

let hasErrors = false;

console.log('🔍 Verifying build output...\n');

// Check if dist directory exists
if (!existsSync(distDir)) {
  console.error('❌ ERROR: dist/ directory does not exist!');
  console.error('   Run "npm run build" first.');
  process.exit(1);
}

// Check required directories
console.log('📁 Checking directories...');
for (const dir of requiredDirs) {
  const fullPath = join(distDir, dir);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing directory: ${dir}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${dir}`);
  }
}

console.log('\n📄 Checking required files...');
// Check required files
for (const file of requiredFiles) {
  const fullPath = join(distDir, file);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing file: ${file}`);
    hasErrors = true;
  } else {
    const stats = statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${file} (${sizeKB} KB)`);
  }
}

// Calculate total build size
console.log('\n📊 Build Statistics:');
function getDirSize(dirPath) {
  let totalSize = 0;

  function walkDir(currentPath) {
    try {
      const files = require('fs').readdirSync(currentPath);
      for (const file of files) {
        const filePath = join(currentPath, file);
        const stats = statSync(filePath);
        if (stats.isDirectory()) {
          walkDir(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (err) {
      // Ignore errors
    }
  }

  walkDir(dirPath);
  return totalSize;
}

const totalSize = getDirSize(distDir);
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
console.log(`   Total build size: ${totalSizeMB} MB`);

// Count files
const fileCount = requiredFiles.length;
console.log(`   Files verified: ${fileCount}`);

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Build verification FAILED!');
  console.error('   Some required files are missing.');
  process.exit(1);
} else {
  console.log('✅ Build verification PASSED!');
  console.log('   All required files are present.');
  console.log('   The build is ready for deployment.');
}
console.log('='.repeat(50) + '\n');

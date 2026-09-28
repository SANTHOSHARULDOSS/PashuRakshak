import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

console.log('=============================================================');
console.log(' 🛡️  Starting PashuRakshak Full-Stack Development Environment');
console.log(' 📍  Govt of Maharashtra Livestock Health Intelligence System');
console.log('=============================================================\n');

const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const tsxBin = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');

// 1. Start Backend Server
const server = spawn(process.execPath, [tsxBin, path.join(__dirname, 'index.ts')], {
  stdio: 'inherit',
  cwd: rootDir,
  env: { ...process.env, PORT: '5000' }
});

// 2. Start Frontend Vite Client
const client = spawn(process.execPath, [viteBin, '--host'], {
  stdio: 'inherit',
  cwd: rootDir
});

function cleanup() {
  console.log('\n[PashuRakshak] Shutting down development services...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
server.on('exit', (code) => {
  if (code !== 0 && code !== null) console.error(`[Server Exited] code ${code}`);
});
client.on('exit', (code) => {
  if (code !== 0 && code !== null) console.error(`[Client Exited] code ${code}`);
});

import { spawn } from 'child_process';
import os from 'os';

console.log('=============================================================');
console.log(' 🛡️  Starting PashuRakshak Full-Stack Development Environment');
console.log(' 📍  Govt of Maharashtra Livestock Health Intelligence System');
console.log('=============================================================\n');

const isWin = os.platform() === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

// 1. Start Backend Server
const server = spawn(npxCmd, ['tsx', 'server/src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

// 2. Start Frontend Vite Client
const client = spawn(npxCmd, ['vite', '--host'], {
  stdio: 'inherit',
  shell: true
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

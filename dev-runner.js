const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 Starting JanSetu Development Environment');
console.log('📡 Backend:  http://localhost:4000');
console.log('💻 Frontend: http://localhost:5173');
console.log('====================================================\n');

const backend = spawn('npm run dev', {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

const frontend = spawn('npm run dev', {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

const cleanExit = () => {
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);



const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🚀 Starting Myusta Admin Panel Development Server...'));

// Set environment variables
process.env.FAST_REFRESH = 'true';
process.env.WDS_SOCKET_PORT = '0';
process.env.GENERATE_SOURCEMAP = 'true';
process.env.REACT_APP_DEBUG = 'true';

// Detect platform and set appropriate polling
const isWindows = process.platform === 'win32';
const isDockerOrNetwork = process.env.DOCKER || process.env.NETWORK_DRIVE;

if (isWindows || isDockerOrNetwork) {
  process.env.CHOKIDAR_USEPOLLING = 'true';
  process.env.CHOKIDAR_INTERVAL = '1000';
  console.log(chalk.yellow('📡 Enabled file polling for Windows/Docker/Network drives'));
}

// Start React Scripts
const child = spawn('react-scripts', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code);
});
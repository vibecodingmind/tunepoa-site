const { spawn } = require('child_process');
const http = require('http');

function startServer() {
  const server = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    detached: false
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}, restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
  
  server.on('error', (err) => {
    console.error(`Server error: ${err}, restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
}

startServer();

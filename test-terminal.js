// Simple WebSocket terminal test
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', function open() {
  console.log('Connected to terminal WebSocket');
  
  // Start terminal
  ws.send(JSON.stringify({ type: 'start' }));
  
  // Send a test command after a short delay
  setTimeout(() => {
    ws.send(JSON.stringify({ type: 'input', data: 'echo "Hello Terminal!"\n' }));
  }, 1000);
  
  // Close after 3 seconds
  setTimeout(() => {
    ws.close();
  }, 3000);
});

ws.on('message', function message(data) {
  const parsed = JSON.parse(data);
  console.log('Received:', parsed);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});
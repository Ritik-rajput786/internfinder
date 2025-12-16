const net = require('net');
const client = net.createConnection({ port: 5000, host: '127.0.0.1' }, () => {
  console.log('connected to server!');
  client.end();
});
client.on('error', (err) => {
  console.error('net error:', err);
});
client.on('end', () => console.log('disconnected'));
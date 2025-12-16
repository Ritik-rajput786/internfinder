const http = require('http');
http.get('http://localhost:5000/', (res) => {
  console.log('statusCode:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('body:', data));
}).on('error', (e) => {
  console.error('http error:', e.message);
});
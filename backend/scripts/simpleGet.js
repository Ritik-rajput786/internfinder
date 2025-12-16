const http = require('http');
http.get('http://localhost:5000/api/jobs', (res) => {
  console.log('Status', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Got', parsed.count || parsed.data?.length, 'jobs');
    } catch (e) {
      console.log('Response:', data);
    }
  });
}).on('error', (err) => {
  console.error('HTTP error:', err.message);
});
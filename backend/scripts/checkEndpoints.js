const axios = require('axios');

const hosts = ['127.0.0.1', 'localhost', '[::1]'];
const path = '/api/jobs?country=India';

(async () => {
  for (const host of hosts) {
    const url = `http://${host}:5000${path}`;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(url, { timeout: 2000 });
        console.log(`OK (${host})`, res.data?.count ?? res.data?.length ?? 'no-count', 'jobs returned');
        break;
      } catch (err) {
        console.log(`Attempt ${i + 1} (${host}) failed:`, err.message);
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  process.exit(0);
})();

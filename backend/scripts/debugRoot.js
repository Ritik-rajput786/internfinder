const axios = require('axios');
(async () => {
  try {
    const r = await axios.get('http://localhost:5000/');
    console.log('root ok:', r.status, r.data);
  } catch (err) {
    if (err.response) console.error('root failed (response):', err.response.status, err.response.data);
    else console.error('root failed (error):', err.message);
  }
})();
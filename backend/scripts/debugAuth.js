const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'teststudent2@example.com', password: 'password123' }, { timeout: 5000 });
    console.log('login response status:', res.status);
    console.log('login data keys:', Object.keys(res.data));
    console.log('login data:', res.data);
  } catch (err) {
    if (err.response) console.error('login failed (response):', err.response.status, err.response.data);
    else {
      console.error('login failed (error):', err.message);
      console.error(err.stack);
    }
  }
})();
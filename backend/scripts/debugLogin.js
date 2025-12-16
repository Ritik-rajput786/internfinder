const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://localhost:5000/api/auth/login', { email: 'teststudent2@example.com', password: 'password123' });
    console.log('login ok:', login.status, login.data);
  } catch (err) {
    if (err.response) console.error('login failed (response):', err.response.status, err.response.data);
    else console.error('login failed (error):', err.message);
  }
})();
const axios = require('axios');
const API = 'http://localhost:5000/api';
(async () => {
  try {
    // login
    const login = await axios.post(`${API}/auth/login`, { email: 'teststudent2@example.com', password: 'password123' });
    const token = login.data.token;
    console.log('Logged in, token:', token ? token.slice(0,20)+'...' : token);

    // get my applications
    const myApps = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('My applications count:', myApps.data.data.length);
    if (!myApps.data.data.length) return console.log('No applications to cancel.');

    const app = myApps.data.data[0];
    console.log('Using application:', app._id, 'jobId:', app.jobId?._id || app.jobId);

    // Try PATCH cancel by application id
    try {
      const res = await axios.patch(`${API}/applications/cancel/${app._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('PATCH cancel response:', res.data);
    } catch (e) {
      console.error('PATCH cancel failed:', e.response?.status, e.response?.data || e.message);
    }

    // Try DELETE cancel by job id
    const jobId = app.jobId?._id || app.jobId;
    try {
      const res2 = await axios.delete(`${API}/applications/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('DELETE cancel response:', res2.data);
    } catch (e) {
      console.error('DELETE cancel failed:', e.response?.status, e.response?.data || e.message);
    }

  } catch (err) {
    console.error('Unexpected error:', err.response?.data || err.message);
  }
})();

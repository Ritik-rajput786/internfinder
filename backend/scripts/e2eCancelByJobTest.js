const axios = require('axios');
const API = 'http://localhost:5000/api';
(async () => {
  try {
    const email = 'autotest@example.com';
    const password = 'password123';
    // Try to register (ignore if already exists)
    try {
      const reg = await axios.post(`${API}/auth/register`, { name: 'Auto Test', email, password });
      console.log('Registered:', reg.data);
    } catch (e) {
      if (e.response) console.log('Register response:', e.response.status, e.response.data.message || e.response.data);
      else console.error('Register error:', e.message);
    }

    const login = await axios.post(`${API}/auth/login`, { email, password });
    console.log('Logged in:', login.data.success);
    const token = login.data.token;

    const jobId = '6940ee202a1339500f0fc1e3';
    console.log('Applying to job', jobId);
    try {
      const apply = await axios.post(`${API}/apply/${jobId}`, { fullName: 'Auto Test', email }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Apply response:', apply.data);
    } catch (e) {
      console.error('Apply error:', e.response?.status, e.response?.data || e.message);
    }

    try {
      const my = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('My applications count:', my.data.data.length);
      const app = my.data.data.find(a => (a.jobId && (a.jobId._id || a.jobId) == jobId) || a.jobId == jobId);
      if (!app) return console.log('Could not find created application');
      console.log('Found app:', app._id, 'status:', app.status);

      console.log('Calling job-level cancel...');
      const res = await axios.patch(`${API}/applications/${jobId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Job-level cancel response:', res.data);

      const my2 = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('After cancel, my applications count:', my2.data.data.length);

    } catch (e) {
      console.error('Error:', e.response?.status, e.response?.data || e.message);
    }

  } catch (err) {
    console.error('Fatal:', err.response?.data || err.message);
  }
})();
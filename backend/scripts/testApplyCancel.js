const axios = require('axios');
const API = 'http://localhost:5000/api';
(async () => {
  try {
    const login = await axios.post(`${API}/auth/login`, { email: 'teststudent2@example.com', password: 'password123' });
    const token = login.data.token;
    console.log('Logged in. token:', token ? token.substring(0, 20) + '...' : 'no-token');
    console.log('login response data:', JSON.stringify(login.data));

    const jobId = '6940ee202a1339500f0fc1e3';
    console.log('Applying to job', jobId);
    // Send fullName/email in body as a fallback for legacy endpoint
    const apply = await axios.post(`${API}/apply/${jobId}`, { fullName: 'Test Student', email: 'teststudent2@example.com' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Apply response:', apply.data);

    const my = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('My applications count:', my.data.data.length);
    const app = my.data.data.find(a => (a.jobId && (a.jobId._id || a.jobId) == jobId) || a.jobId == jobId);
    if (!app) return console.log('Could not find application for job');
    console.log('Found app:', app._id);

    // Cancel via PATCH by application id
    try {
      const cancel = await axios.patch(`${API}/applications/cancel/${app._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('PATCH cancel result:', cancel.data);
    } catch (e) {
      console.error('PATCH cancel error:', e.response?.status, e.response?.data || e.message);
    }

    // Also test cancel-by-job (DELETE)
    try {
      const cancel2 = await axios.delete(`${API}/applications/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('DELETE cancel result:', cancel2.data);
    } catch (e) {
      console.error('DELETE cancel error:', e.response?.status, e.response?.data || e.message);
    }

  } catch (err) {
    if (err.response) {
      console.error('Unexpected (response):', err.response.status, JSON.stringify(err.response.data));
    } else {
      console.error('Unexpected (error):', err.message);
    }
  }
})();

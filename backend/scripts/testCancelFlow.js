const axios = require('axios');

const API = 'http://localhost:5000/api';

async function run() {
  try {
    const loginResp = await axios.post(`${API}/auth/login`, { email: 'teststudent2@example.com', password: 'password123' });
    const token = loginResp.data.token;
    console.log('Token:', token ? token.slice(0,20)+'...' : token);

    // Apply to an internal job
    const jobId = '6940ee202a1339500f0fc1e3';
    const applyResp = await axios.post(`${API}/apply/${jobId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Apply response:', applyResp.data);

    // Get my applications
    const myApps = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('My apps count:', myApps.data.data.length);
    const appId = myApps.data.data[0]._id;

    // Cancel application
    const cancelResp = await axios.patch(`${API}/applications/cancel/${appId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Cancel response:', cancelResp.data);

  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
    console.error('Error Message:', err.message);
  }
}

run();

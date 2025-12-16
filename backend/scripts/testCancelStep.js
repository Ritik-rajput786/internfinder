const axios = require('axios');
(async () => {
  const API = 'http://127.0.0.1:5000/api';
  try {
    const login = await axios.post(`${API}/auth/login`, { email: 'teststudent2@example.com', password: 'password123' });
    console.log('login ok:', login.data.success);
    const token = login.data.token;
    // Apply
    try {
      const apply = await axios.post(`${API}/apply/6940ee202a1339500f0fc1e3`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('apply:', apply.data);
    } catch (e) {
      console.error('apply err:', e.response?.status, e.response?.data);
    }

    // get my apps
    try {
      const myapps = await axios.get(`${API}/applications/my`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('myapps count:', myapps.data.data.length);
      if (myapps.data.data.length === 0) return;
      const appId = myapps.data.data[0]._id;
      // cancel
      try {
        const cancel = await axios.patch(`${API}/applications/cancel/${appId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        console.log('cancel ok:', cancel.data);
      } catch (e) {
        console.error('cancel err:', e.response?.status, e.response?.data);
      }
    } catch (e) {
      console.error('myapps err:', e.response?.status, e.response?.data);
    }
  } catch (err) {
    console.error('login err:', err.response?.status, err.response?.data);
  }
})();

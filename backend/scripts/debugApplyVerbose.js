const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';

(async () => {
  try {
    const email = 'debugapply@example.com';
    const password = 'password123';

    // Register (ignore 400s)
    try {
      const reg = await axios.post(`${API}/auth/register`, { name: 'Debug Apply', email, password });
      console.log('Register response:', reg.status, reg.data);
    } catch (e) {
      console.log('Register error:', e.response?.status, e.response?.data || e.message);
    }

    // Login
    let token;
    try {
      const login = await axios.post(`${API}/auth/login`, { email, password });
      console.log('Login response:', login.status, login.data);
      token = login.data.token;
    } catch (e) {
      console.error('Login error:', e.response?.status, e.response?.data || e.message);
      return;
    }

    // Get jobs
    let job;
    try {
      const jobsRes = await axios.get(`${API}/jobs`);
      console.log('Jobs fetch status:', jobsRes.status);
      const jobs = jobsRes.data.data || jobsRes.data;
      console.log('Jobs count:', Array.isArray(jobs) ? jobs.length : Object.keys(jobs).length);
      job = (Array.isArray(jobs) ? jobs.find(j => (j.applyType === 'internal')) : null) || (Array.isArray(jobs) ? jobs[0] : null);
      if (!job) return console.error('No job found to apply');
      console.log('Selected job:', job._id || job.id, job.title, job.applyType);
    } catch (e) {
      console.error('Jobs fetch error:', e.response?.status, e.response?.data || e.message);
      return;
    }

    // Create temp pdf
    const tmpPdf = path.join(__dirname, 'tmp_debug_resume.pdf');
    fs.writeFileSync(tmpPdf, '%PDF-1.4\n%#\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    // FormData
    const form = new FormData();
    form.append('jobId', job._id);
    form.append('fullName', 'Debug Apply');
    form.append('email', email);
    form.append('phone', '9999999999');
    form.append('college', 'Debug University');
    form.append('degree', 'B.Tech');
    form.append('currentYear', '3');
    form.append('skills', 'React,Node');
    form.append('message', 'Testing debug apply');
    form.append('resume', fs.createReadStream(tmpPdf));

    try {
      const res = await axios.post(`${API}/applications/apply`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }, maxContentLength: Infinity, maxBodyLength: Infinity });
      console.log('Apply response:', res.status, res.data);
    } catch (e) {
      console.error('Apply error:', e.response?.status, e.response?.data || e.message);
    } finally {
      fs.unlinkSync(tmpPdf);
    }

  } catch (err) {
    console.error('Fatal error:', err.message || err);
  }
})();
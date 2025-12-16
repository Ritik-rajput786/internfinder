const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API = 'http://localhost:5000/api';

(async () => {
  try {
    // Ensure test user exists
    const email = 'testapply@example.com';
    const password = 'password123';
    try {
      await axios.post(`${API}/auth/register`, { name: 'Apply Test', email, password });
      console.log('Registered test user');
    } catch (e) {
      console.log('Register skipped or failed (likely exists):', e.response?.data?.message || e.message);
    }

    const login = await axios.post(`${API}/auth/login`, { email, password });
    const token = login.data.token;
    console.log('Logged in, token:', Boolean(token));

    // Find an internal job
    const jobsRes = await axios.get(`${API}/jobs`, { params: { country: 'India' } });
    const jobs = jobsRes.data.data || jobsRes.data;
    if (!jobs || jobs.length === 0) return console.error('No jobs found');
    const job = jobs.find(j => (j.applyType || j.jobType || 'internal').toLowerCase() === 'internal') || jobs[0];
    console.log('Using job:', job._id, job.title);

    // Create a small PDF file
    const tmpPdf = path.join(__dirname, 'temp_resume.pdf');
    fs.writeFileSync(tmpPdf, '%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

    const form = new FormData();
    form.append('jobId', job._id);
    form.append('fullName', 'Apply Test');
    form.append('email', email);
    form.append('phone', '9876543210');
    form.append('college', 'Test University');
    form.append('degree', 'B.Tech');
    form.append('currentYear', '3');
    form.append('skills', 'React,Node');
    form.append('message', 'Testing resume upload');
    form.append('resume', fs.createReadStream(tmpPdf));

    const res = await axios.post(`${API}/applications/apply`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` } });
    console.log('Apply response:', res.data);

    fs.unlinkSync(tmpPdf);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
})();
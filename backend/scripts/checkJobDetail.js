const axios = require('axios');
(async () => {
  try {
    const API = 'http://localhost:5000/api';
    const jobs = await axios.get(`${API}/jobs`);
    console.log('Jobs count:', jobs.data.count || jobs.data.data.length);
    const j = jobs.data.data && jobs.data.data[0];
    if (!j) {
      console.log('No jobs available');
      return;
    }
    console.log('Sample job (summary):', { id: j.id, title: j.title, salaryDisplay: j.salaryDisplay, skills: j.skills });
    const jobDetail = await axios.get(`${API}/jobs/${j.id}`);
    console.log('Job detail returned keys:', Object.keys(jobDetail.data.data));
    console.log('Salary display:', jobDetail.data.data.salaryDisplay);
    console.log('Skills:', jobDetail.data.data.skills);
    console.log('Responsibilities (partial):', jobDetail.data.data.responsibilities && jobDetail.data.data.responsibilities.slice(0,3));
  } catch (err) {
    console.error('Request error:', err.message);
    if (err.response) console.error('Response:', err.response.data);
  }
})();
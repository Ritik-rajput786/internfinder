// Thin application service wrapper to provide clear function names expected by UI
import { applyForJob, submitApplication, cancelApplicationByJob } from './api';

// Apply to a job. If formData is provided, submit as multipart form (resume, extra fields).
export const applyJob = async (jobId, formData) => {
  if (formData) {
    if (!formData.has('jobId')) formData.append('jobId', jobId);
    return await submitApplication(formData);
  }
  return await applyForJob(jobId);
};

// Cancel application by jobId (used on Jobs page to quickly cancel an application)
export const cancelApplication = async (jobId) => {
  return await cancelApplicationByJob(jobId);
};

export default {
  applyJob,
  cancelApplication
};

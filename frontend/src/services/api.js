// Import axios for making HTTP requests
import axios from 'axios';

// Base URL for the backend API (change if your backend runs on different port)
const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid/expired, remove it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Login user and get JWT token
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// ============ JOB APIs ============

// Get all jobs and internships
export const getJobs = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

// Get a single job by ID
export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

// Add a new job (for admin - not used in current frontend)
export const addJob = async (jobData) => {
  const response = await api.post('/jobs/add', jobData);
  return response.data;
};

// ============ APPLICATION APIs ============

// Apply for a job/internship (legacy simple endpoint)
export const applyForJob = async (jobId) => {
  const response = await api.post(`/apply/${jobId}`);
  return response.data;
};

// Submit full application with resume (multipart/form-data)
export const submitApplication = async (formData, onUploadProgress) => {
  // Do not force Content-Type header here; let axios set the multipart boundary
  const response = await api.post('/applications/apply', formData, {
    onUploadProgress
  });
  return response.data;
};

// Get all applications by logged-in user (try preferred endpoint first)
export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my');
    return response.data;
  } catch (err) {
    const response = await api.get('/my-applications');
    return response.data;
  }
};

// Cancel an application by application id
export const cancelApplication = async (applicationId) => {
  const response = await api.patch(`/applications/cancel/${applicationId}`);
  // return the full payload (application + updated list)
  return response.data;
};

// Cancel an application by job id (convenience)
// Cancel an application by job id (convenience) - uses PATCH /applications/:jobId/cancel
export const cancelApplicationByJob = async (jobId) => {
  const response = await api.patch(`/applications/${jobId}/cancel`);
  return response.data; // expected { success: true, jobId }
};

// Get user's application by id (helper)
export const getApplicationById = async (id) => {
  const response = await api.get(`/applications/${id}`);
  return response.data;
};


// ============ EXTERNAL JOBS APIs ============

// Get jobs from external public APIs (Remotive, etc.)
export const getExternalJobs = async () => {
  const response = await api.get('/external-jobs');
  return response.data;
};

// ============ COMPANIES APIs ============

// Get aggregated list of companies
export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

export default api;


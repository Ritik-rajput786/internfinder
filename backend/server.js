// Import Express framework
const express = require('express');
// Import CORS to allow frontend requests
const cors = require('cors');
// Import dotenv to load environment variables from .env file
require('dotenv').config();
// Import the database connection function
const connectDB = require('./config/db');

// Create an Express application
const app = express();

// Enable CORS - allows frontend to make requests to backend
app.use(cors());

// Middleware to parse JSON data from request body
// This allows us to access req.body in routes
app.use(express.json());

// Serve uploaded files (resumes)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define the port number
const PORT = 5000;

// Connect to MongoDB database
// Ensure DB is connected and seed jobs if collection is empty
connectDB().then(async () => {
    try {
        const Job = require('./models/Job');
        const seedJobs = require('./scripts/seedJobs');
        const count = await Job.countDocuments();
        if (count === 0) {
            console.log('Jobs collection empty — seeding sample jobs...');
            const seeded = await seedJobs();
            console.log(`Auto-seeded ${seeded} jobs`);
        } else {
            console.log(`Jobs collection has ${count} records`);
        }
    } catch (err) {
        console.error('Error during auto-seed:', err);
    }
}).catch(err => console.error('DB connection error during startup:', err));

// Import auth routes
const authRoutes = require('./routes/authRoutes');
// Use auth routes - all routes in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Import job routes
const jobRoutes = require('./routes/jobRoutes');
// Use job routes - all routes in jobRoutes will be prefixed with /api/jobs
app.use('/api/jobs', jobRoutes);

// Import application routes
const applicationRoutes = require('./routes/applicationRoutes');
// Use application routes - all routes in applicationRoutes will be prefixed with /api
app.use('/api', applicationRoutes);

// Import external jobs routes
const externalJobsRoutes = require('./routes/externalJobsRoutes');
// Use external jobs routes - all routes in externalJobsRoutes will be prefixed with /api/external-jobs
app.use('/api/external-jobs', externalJobsRoutes);

// Import companies routes
const companiesRoutes = require('./routes/companiesRoutes');
// Use companies routes - all routes in companiesRoutes will be prefixed with /api/companies
app.use('/api/companies', companiesRoutes);

// Define a route for the root path "/"
// When someone visits "http://localhost:5000/", this function runs
app.get('/', (req, res) => {
    // Send a test message as response
    res.send('Hello! This is a test message from the Express server.');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    // This message will appear in the terminal when server starts
    console.log(`Server is running on http://localhost:${PORT}`);
});


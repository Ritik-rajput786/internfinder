// Import Express to create router
const express = require('express');
// Import Job model to interact with database
const Job = require('../models/Job');

// Create router to handle routes
const router = express.Router();

// POST /api/jobs/add - Add a new job or internship
router.post('/add', async (req, res) => {
    try {
        // Get job details from request body
        const { title, company, location, type, description } = req.body;

        // Check if all required fields are provided
        if (!title || !company || !location || !type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields: title, company, location, type, description'
            });
        }

        // Check if type is valid (only "Job" or "Internship" allowed)
        if (type !== 'Job' && type !== 'Internship') {
            return res.status(400).json({
                success: false,
                message: 'Type must be either "Job" or "Internship"'
            });
        }

        // Create new job in database
        const job = await Job.create({
            title,
            company,
            location,
            type,
            description
        });

        // Return success response with created job data
        res.status(201).json({
            success: true,
            message: 'Job added successfully',
            data: job
        });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Helper: generate sensible defaults for a job object
function enrichJob(j) {
    // ensure plain object
    const job = (j.toObject) ? j.toObject() : { ...(j || {}) };

    // Detect role category for skill defaults
    const title = (job.title || '').toLowerCase();
    let defaultSkills = ['React','HTML','CSS','JavaScript'];
    if (/back|node|express|java|python|django|spring/.test(title)) defaultSkills = ['Node.js','Express','MongoDB'];
    if (/full|mern|fullstack/.test(title)) defaultSkills = ['React','Node.js','Express','MongoDB'];

    // Default responsibilities
    const defaultResponsibilities = [
        'Write clean, maintainable code',
        'Collaborate with the team',
        'Implement assigned features and fixes'
    ];

    // Default eligibility & perks
    const defaultEligibility = 'Students and freshers (0-2 years) or relevant experience';
    const defaultPerks = ['Certificate', 'PPO opportunity', 'Flexible hours', 'Work from home'];

    // Salary / stipend display logic
    let salaryDisplay = job.salary || null;
    if (!salaryDisplay) {
        if (job.type === 'Internship') {
            salaryDisplay = job.stipend || '₹8,000 – ₹15,000 / month';
        } else {
            salaryDisplay = (job.salaryMin && job.salaryMax) ? `₹${job.salaryMin} – ₹${job.salaryMax} / year` : (job.salary || '₹3 LPA – ₹8 LPA');
        }
    }

    // Skills: prefer explicit skills, then skillsRequired, then defaults
    const skills = (job.skills && job.skills.length) ? job.skills : (job.skillsRequired && job.skillsRequired.length) ? job.skillsRequired : defaultSkills;

    // Responsibilities: prefer array, else fallback text
    const responsibilities = (job.responsibilities && job.responsibilities.length) ? job.responsibilities : defaultResponsibilities;

    const perks = (job.perks && job.perks.length) ? job.perks : defaultPerks;
    const eligibility = job.eligibility || defaultEligibility;
    const aboutCompany = job.aboutCompany || `${job.company} is hiring for this role. Apply to learn more about the company's projects and culture.`;

    return {
        ...job,
        salaryDisplay,
        skills,
        responsibilities,
        perks,
        eligibility,
        aboutCompany
    };
}

// GET /api/jobs - Get all jobs and internships
router.get('/', async (req, res) => {
    try {
        // Support query filters: country=India, platform, city, type (Job/Internship)
        const { country, platform, city, type } = req.query;

        // Find all jobs and sort by createdAt (newest first)
        let jobs = await Job.find().sort({ createdAt: -1 }).lean();

        // Normalize and map jobs to the API-friendly format
        let normalized = jobs.map(j => {
            const enriched = enrichJob(j);
            return ({
                id: enriched._id,
                title: enriched.title,
                company: enriched.company,
                location: enriched.location,
                city: enriched.city || enriched.location,
                country: enriched.country || 'India',
                type: enriched.type,
                jobType: enriched.jobType || 'Internal',
                applyType: enriched.applyType || (enriched.jobType === 'Platform' ? 'external' : 'internal'),
                applyUrl: enriched.applyUrl || null,
                platform: enriched.platform || null,
                isVerified: !!enriched.isVerified,
                createdAt: enriched.createdAt,
                salaryDisplay: enriched.salaryDisplay,
                skills: enriched.skills
            });
        });

        // Country filter (India-only)
        if (country && country.toLowerCase() === 'india') {
            normalized = normalized.filter(j => (j.country || '').toLowerCase() === 'india' || /india/i.test(j.location || j.city || ''));
        }

        // Platform filter (e.g., Internshala)
        if (platform) {
            normalized = normalized.filter(j => (j.platform || '').toLowerCase() === platform.toLowerCase());
        }

        // City filter
        if (city) {
            normalized = normalized.filter(j => (j.city || '').toLowerCase().includes(city.toLowerCase()));
        }

        // Type filter (Job / Internship)
        if (type) {
            normalized = normalized.filter(j => (j.type || '').toLowerCase() === type.toLowerCase());
        }

        res.status(200).json({ success: true, count: normalized.length, data: normalized });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET /api/jobs/:id - Get a single job by ID
router.get('/:id', async (req, res) => {
    try {
        // Get job ID from URL parameters
        const jobId = req.params.id;

        // Find job by ID in database
        const job = await Job.findById(jobId);

        // Check if job exists
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Enrich job with defaults for missing fields
        const enriched = enrichJob(job);

        // Return success response with job data
        res.status(200).json({
            success: true,
            data: enriched
        });

    } catch (error) {
        // Check if error is due to invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        // If any other error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE /api/jobs/:id - Delete a job by ID
router.delete('/:id', async (req, res) => {
    try {
        // Get job ID from URL parameters
        const jobId = req.params.id;

        // Find and delete job by ID from database
        const job = await Job.findByIdAndDelete(jobId);

        // Check if job exists
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
            data: {}
        });

    } catch (error) {
        // Check if error is due to invalid ID format
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format'
            });
        }

        // If any other error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Export router to use in server.js
module.exports = router;



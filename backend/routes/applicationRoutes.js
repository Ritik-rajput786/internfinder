// Import Express to create router
const express = require('express');
// Import Application model to interact with database
const Application = require('../models/Application');
// Import Job model to verify job exists
const Job = require('../models/Job');
// Import authentication middleware to protect routes
const protect = require('../middleware/authMiddleware');

// Create router to handle routes
const router = express.Router();

// Multer setup for resume uploads
const path = require('path');
const multer = require('multer');
const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
const fs = require('fs');
// Ensure upload directory exists
if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, resumesDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g,'-')}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/i)) return cb(new Error('Only PDF resumes allowed'));
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// All routes in this file require authentication
// We use protect middleware to verify JWT token

// POST /api/apply/:jobId - Apply for a job/internship (simple endpoint kept for compatibility)
// This route now populates required fields (fullName, email) from the authenticated user
router.post('/apply/:jobId', protect, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user._id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const existingApplication = await Application.findOne({ userId, jobId });
        if (existingApplication) return res.status(400).json({ success: false, message: 'You have already applied for this job' });

        // Provide required applicant fields from user profile to satisfy model validation
        console.log('legacy apply: req.user object:', req.user);
        try {
          const obj = req.user.toObject ? req.user.toObject() : req.user;
          console.log('legacy apply: req.user keys:', Object.keys(obj));
          console.log('legacy apply: name,email ->', obj.name, obj.email);
        } catch (ex) {
          console.log('legacy apply: req.user introspect error', ex.message);
        }
        // Double-check user record from DB (avoid cases where req.user may be missing fields)
        const dbUser = await require('../models/User').findById(userId).select('name email');
        const fullName = (dbUser && (dbUser.name || dbUser.fullName)) || (req.user && (req.user.name || req.user.fullName)) || req.body.fullName || '';
        const email = (dbUser && dbUser.email) || (req.user && req.user.email) || req.body.email || '';

        console.log('legacy apply: dbUser.name,email ->', fullName, email);

        // If profile is missing required applicant fields, return a clear 400 error
        if (!fullName || !email) {
            console.log('legacy apply: missing required profile fields', { fullNameMissing: !fullName, emailMissing: !email });
            return res.status(400).json({ success: false, message: 'Profile incomplete: name and email are required to apply. Please update your profile.' });
        }

        const application = await Application.create({ userId, jobId, fullName, email });

        await application.populate('jobId', 'title company location type description');

        res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });

    } catch (error) {
        // Validation error (missing required fields) should be a 400
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Invalid application data', error: error.message });
        }

        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid job ID format' });
        }

        console.error('Apply (legacy) error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// NEW: POST /api/applications/apply - full apply with resume upload and form data
router.post('/applications/apply', protect, upload.single('resume'), async (req, res) => {
    try {
        const { jobId, fullName, email, phone, college, degree, currentYear, skills, message } = req.body;

        if (!jobId || !fullName || !email) {
            return res.status(400).json({ success: false, message: 'jobId, fullName and email are required' });
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        // Only allow applying to internal jobs
        if (job.applyType && job.applyType !== 'internal') {
            return res.status(400).json({ success: false, message: 'Cannot apply here. Please use external platform link.' });
        }

        // Check if user already applied (only consider active applications as duplicates)
        const existing = await Application.findOne({ userId: req.user._id, jobId });
        const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : undefined;

        if (existing && existing.status === 'Applied') {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        // If previously cancelled, update existing application record to re-apply
        if (existing && existing.status === 'Cancelled') {
            existing.fullName = fullName;
            existing.email = email;
            existing.phone = phone;
            existing.college = college;
            existing.degree = degree;
            existing.currentYear = currentYear;
            existing.skills = skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [];
            existing.message = message;
            if (resumeUrl) existing.resumeUrl = resumeUrl;
            existing.status = 'Applied';
            existing.appliedAt = Date.now();
            await existing.save();
            const apps = await Application.find({ userId: req.user._id }).populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' }).sort({ appliedAt: -1 });
            return res.status(200).json({ success: true, message: 'Application re-submitted', application: existing, data: apps });
        }

        const app = new Application({
            userId: req.user._id,
            jobId,
            fullName,
            email,
            phone,
            college,
            degree,
            currentYear,
            skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
            message,
            resumeUrl
        });

        await app.save();
        // Return user's updated application list (so frontend can sync without extra request)
        const apps = await Application.find({ userId: req.user._id }).populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' }).sort({ appliedAt: -1 });

        return res.status(201).json({ success: true, message: 'Application submitted', application: app, data: apps });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// New: PATCH /api/applications/:jobId/cancel - cancel by jobId (alias)
router.patch('/applications/:jobId/cancel', protect, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        // Atomically update status without triggering document validation (avoid failing if some fields are missing)
        const app = await Application.findOneAndUpdate({ userId: req.user._id, jobId }, { $set: { status: 'Cancelled' } }, { new: true });
        if (!app) return res.status(404).json({ success: false, message: 'Application not found for this job' });
        if (app.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
        // Return user's updated applications list (so frontend can refresh MyApplications if needed)
        const apps = await Application.find({ userId: req.user._id }).populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' }).sort({ appliedAt: -1 });

        return res.json({ success: true, jobId, data: apps });
    } catch (err) {
        console.error('Cancel-by-job (patch) error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});


// GET /api/my-applications - Get all jobs applied by logged-in user (legacy)
router.get('/my-applications', protect, async (req, res) => {
    try {
        // Get userId from req.user (set by authMiddleware)
        const userId = req.user._id;

        // Find all applications for this user
        // Populate jobId to get full job details instead of just ID
        // Sort by appliedAt in descending order (newest first)
        const applications = await Application.find({ userId: userId })
            .populate('jobId', 'title company location type description createdAt')
            .sort({ appliedAt: -1 });

        // Return success response with applications data
        res.status(200).json({
            success: true,
            count: applications.length, // Total number of applications
            data: applications
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

// NEW: GET /api/applications/my - preferred endpoint to return user's applications
router.get('/applications/my', protect, async (req, res) => {
    try {
        const apps = await Application.find({ userId: req.user._id })
            .populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' })
            .sort({ appliedAt: -1 });

        return res.json({ success: true, data: apps });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// NEW: PATCH /api/applications/cancel/:id - cancel an application
// Cancel by application ID - return updated application list for the user
router.patch('/applications/cancel/:id', protect, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
        if (app.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        // Use findByIdAndUpdate to avoid re-validating missing fields
        const updated = await Application.findByIdAndUpdate(app._id, { $set: { status: 'Cancelled' } }, { new: true });

        // Return user's updated applications list
        const apps = await Application.find({ userId: req.user._id }).populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' }).sort({ appliedAt: -1 });
        return res.json({ success: true, message: 'Application cancelled', application: updated, data: apps });
    } catch (err) {
        console.error('Cancel error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Cancel by jobId (convenience endpoint) - DELETE /api/applications/:jobId
router.delete('/applications/:jobId', protect, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        // find the application for this user and job
        const app = await Application.findOne({ userId: req.user._id, jobId });
        if (!app) return res.status(404).json({ success: false, message: 'Application not found for this job' });
        // Update without re-validation
        const updated = await Application.findByIdAndUpdate(app._id, { $set: { status: 'Cancelled' } }, { new: true });
        console.log(`Application for job ${jobId} cancelled by user ${req.user._id}`);

        // Return user's updated applications list
        const apps = await Application.find({ userId: req.user._id }).populate({ path: 'jobId', select: 'title company city country jobType type applyType applyUrl' }).sort({ appliedAt: -1 });
        return res.json({ success: true, message: 'Application cancelled', application: updated, data: apps });
    } catch (err) {
        console.error('Cancel-by-job error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Export router to use in server.js
module.exports = router;



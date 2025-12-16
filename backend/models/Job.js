// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Define the Job schema (structure of job data in database)
const jobSchema = new mongoose.Schema({
    // Job title - required field
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true // Removes extra spaces from beginning and end
    },
    // Company name - required field
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    // Job location - required field (e.g., "Mumbai", "Remote", "Bangalore")
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    // Optional city field (normalized Indian city when available)
    city: {
        type: String,
        trim: true,
        default: null
    },
    // Country (default to India for this project)
    country: {
        type: String,
        trim: true,
        default: 'India'
    },
    // Job type - either "Job" or "Internship"
    type: {
        type: String,
        required: [true, 'Please specify job type'],
        enum: ['Job', 'Internship'], // Only allow these two values
        trim: true
    },
    // Job classification for platform/external/internal
    jobType: {
        type: String,
        enum: ['Internal', 'Platform', 'ExternalAPI'],
        default: 'Internal'
    },
    // How to apply: internal (through our site) or external (redirect)
    applyType: {
        type: String,
        enum: ['internal', 'external'],
        default: 'internal'
    },
    // External apply URL (if applicable)
    applyUrl: {
        type: String,
        trim: true,
        default: null
    },
    // Platform name e.g., Internshala, Unstop, Microsoft
    platform: {
        type: String,
        trim: true,
        default: null
    },
    // Mark verified Indian job/platform
    isVerified: {
        type: Boolean,
        default: false
    },
    // Job description - required field
    description: {
        type: String,
        required: [true, 'Please add a job description'],
        trim: true
    },
    // Optional fields for richer job detail page
    salary: { type: String, trim: true, default: null },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    stipend: { type: String, trim: true, default: null },
    stipendMin: { type: Number, default: null },
    stipendMax: { type: Number, default: null },
    experience: { type: String, trim: true, default: null },
    responsibilities: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    skillsRequired: { type: [String], default: [] },
    eligibility: { type: String, trim: true, default: null },
    perks: { type: [String], default: [] },
    aboutCompany: { type: String, trim: true, default: null },
    // Created date - automatically added by timestamps option
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
});

// Create and export the Job model
// This model will be used to interact with the 'jobs' collection in MongoDB
module.exports = mongoose.model('Job', jobSchema);



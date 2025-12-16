// Import mongoose to create schema and model
const mongoose = require('mongoose');

// Define the Application schema (structure of application data in database)
const applicationSchema = new mongoose.Schema({
    // Reference to User model - who applied for the job
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: [true, 'User ID is required']
    },
    // Reference to Job model - which job/internship was applied for
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', // Reference to Job model
        required: [true, 'Job ID is required']
    },

    // Applicant details
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true },
    phone: { type: String, trim: true },
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    currentYear: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    message: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },

    // Application status and timestamp
    status: { type: String, enum: ['Applied', 'Cancelled'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
});

// Create partial unique index to prevent duplicate ACTIVE applications (allow re-apply after cancellation)
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true, partialFilterExpression: { status: 'Applied' } });
// Create and export the Application model
// This model will be used to interact with the 'applications' collection in MongoDB
module.exports = mongoose.model('Application', applicationSchema);



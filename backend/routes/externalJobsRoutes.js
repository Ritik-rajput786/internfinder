// Import Express to create router
const express = require('express');
// Import external jobs service
const { fetchExternalJobs } = require('../services/externalJobsService');

// Create router to handle routes
const router = express.Router();

// GET /api/external-jobs - Fetch jobs from external public APIs
router.get('/', async (req, res) => {
  try {
    // Fetch jobs from external APIs (Remotive, etc.)
    const externalJobs = await fetchExternalJobs();

    // Return success response with external jobs
    // Note: These jobs are NOT stored in database, fetched live
    res.status(200).json({
      success: true,
      count: externalJobs.length,
      data: externalJobs,
      message: 'External jobs fetched successfully'
    });

  } catch (error) {
    // If error occurs, return empty array (graceful degradation)
    // Frontend will still show platform jobs even if external API fails
    console.error('Error in external jobs route:', error);
    res.status(200).json({
      success: false,
      count: 0,
      data: [],
      message: 'Unable to fetch external jobs at the moment',
      error: error.message
    });
  }
});

// Export router to use in server.js
module.exports = router;



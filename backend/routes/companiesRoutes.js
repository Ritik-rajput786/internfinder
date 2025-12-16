// Import Express to create router
const express = require('express');
// Import Job model to fetch platform jobs
const Job = require('../models/Job');
// Import external jobs service
const { fetchExternalJobs } = require('../services/externalJobsService');

// Create router to handle routes
const router = express.Router();
const INDIA_COMPANIES = require('../config/indiaCompanies');
const { isIndiaLocation, normalizeCity, ALLOWED_CITIES } = require('../config/indiaConfig');

/**
 * Helper function to extract industry from job title/description
 * Simple keyword-based industry detection
 */
const detectIndustry = (title, description) => {
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  if (combined.match(/\b(software|developer|programmer|coding|tech|it|engineering|full.?stack|frontend|backend|react|node|python|java|javascript)\b/)) {
    return 'IT & Software';
  }
  if (combined.match(/\b(marketing|digital marketing|social media|content|seo|sem|advertising|brand)\b/)) {
    return 'Marketing';
  }
  if (combined.match(/\b(finance|financial|accounting|banking|investment|accountant)\b/)) {
    return 'Finance';
  }
  if (combined.match(/\b(design|ui|ux|graphic|creative|illustrator|photoshop)\b/)) {
    return 'Design';
  }
  if (combined.match(/\b(sales|business development|bde|bdm)\b/)) {
    return 'Sales';
  }
  if (combined.match(/\b(hr|human resources|recruitment|talent)\b/)) {
    return 'Human Resources';
  }
  if (combined.match(/\b(data|analyst|data science|machine learning|ai|analytics)\b/)) {
    return 'Data & Analytics';
  }
  
  return 'Other'; // Default industry
};

/**
 * GET /api/companies - Get aggregated list of companies from platform and external jobs
 * Returns unique companies with job counts, locations, and industries
 */
router.get('/', async (req, res) => {
  try {
    // Fetch platform jobs from MongoDB
    const platformJobs = await Job.find().lean();
    console.log(`Found ${platformJobs.length} platform jobs in database`);

    // Fetch external jobs from public APIs (with caching)
    let externalJobs = [];
    try {
      externalJobs = await fetchExternalJobs(true); // Use cache
      console.log(`Fetched ${externalJobs.length} external jobs`);
    } catch (error) {
      console.error('Error fetching external jobs for companies:', error);
      // Continue with platform jobs only if external fails
    }

    // Combine all jobs
    const allJobs = [
      ...platformJobs.map(job => ({ 
        ...job, 
        source: 'platform',
        company: job.company || 'Unknown Company'
      })),
      ...externalJobs.map(job => ({ 
        ...job, 
        source: 'external',
        company: job.company || 'Unknown Company'
      }))
    ];

    console.log(`Total jobs to aggregate: ${allJobs.length}`);

    // Filter allJobs to India-only (external jobs already filtered) and platform jobs that are India-only
    const indiaJobs = allJobs.filter(job => {
      const loc = job.city || job.location || job.candidate_required_location || '';
      return isIndiaLocation(loc);
    });

    // For each whitelisted Indian company, compute job counts and details
    const companies = INDIA_COMPANIES.map((comp) => {
      const normalizedComp = comp.name.toLowerCase();
      // Find jobs matching this company name (case-insensitive substring match), only India jobs
      const jobsForCompany = indiaJobs.filter(job => (job.company || '').toLowerCase().includes(normalizedComp));

      if (jobsForCompany.length === 0) return null; // Exclude companies with no India jobs

      // Determine most common city among jobs or fallback to 'Remote India'
      const cityCounts = {};
      jobsForCompany.forEach(j => {
        const c = (j.city || j.location || '').toString();
        const normalizedCity = normalizeCity(c) || 'Remote India';
        cityCounts[normalizedCity] = (cityCounts[normalizedCity] || 0) + 1;
      });
      const city = Object.keys(cityCounts).sort((a,b) => cityCounts[b] - cityCounts[a])[0] || 'Remote India';

      return {
        id: comp.name.toLowerCase().replace(/\s+/g,'-'),
        name: comp.name,
        industry: comp.industry,
        city,
        country: 'India',
        totalJobs: jobsForCompany.length,
        logo: comp.logo || null,
        isVerified: !!comp.isVerified
      };
    }).filter(Boolean).sort((a,b) => b.totalJobs - a.totalJobs);

    console.log(`Aggregated ${companies.length} unique companies`);

    // Return success response with companies data
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });

  } catch (error) {
    // If any error occurs, send error response
    console.error('Error in companies route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});



// GET /api/companies/:id/jobs - Get India-only jobs for a given company (id from whitelist)
router.get('/:id/jobs', async (req, res) => {
  try {
    const companyId = req.params.id;
    const compEntry = INDIA_COMPANIES.find(c => c.name.toLowerCase().replace(/\s+/g,'-') === companyId);
    if (!compEntry) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Fetch all jobs (platform + external)
    const platformJobs = await Job.find().lean();
    let externalJobs = [];
    try {
      externalJobs = await fetchExternalJobs(true);
    } catch (err) {
      console.error('Error fetching external jobs for company jobs route:', err);
    }

    const allJobs = [
      ...platformJobs.map(j => ({ ...j, source: 'Internal' })),
      ...externalJobs.map(j => ({ ...j, source: 'External' }))
    ];

    // Filter India-only and company match
    const jobsForCompany = allJobs.filter(job => {
      const loc = job.city || job.location || job.candidate_required_location || '';
      if (!isIndiaLocation(loc)) return false;
      return (job.company || '').toLowerCase().includes(compEntry.name.toLowerCase());
    }).map(job => ({
      id: job._id || job.id || job.externalId,
      title: job.title,
      company: job.company,
      city: normalizeCity(job.city || job.location || ''),
      type: job.type === 'Internship' ? 'Internship' : 'Job',
      applyPlatform: job.applyPlatform || (job.source === 'Internal' ? 'Internal' : null),
      applyUrl: job.applyUrl || job.applyLink || null,
      source: job.source === 'External' ? 'External' : 'Internal'
    }));

    res.status(200).json({ success: true, count: jobsForCompany.length, data: jobsForCompany });
  } catch (error) {
    console.error('Error in company jobs route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Export router to use in server.js
module.exports = router;


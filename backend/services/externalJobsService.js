// Service to fetch jobs from external public APIs
// This file handles fetching jobs from legal public job APIs (no scraping)

const axios = require('axios');
const { isIndiaLocation, normalizeCity } = require('../config/indiaConfig');

// In-memory cache for external jobs
// Cache structure: { data: [...jobs], timestamp: Date, expiresAt: Date }
let jobsCache = null;
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

/**
 * Strip HTML tags from text (simple implementation)
 * External APIs may return HTML in descriptions
 */
const stripHtml = (html) => {
  if (!html) return '';
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim()
    .substring(0, 500); // Limit description length
};

/**
 * Fetch jobs from Remotive API (Free public API for remote jobs)
 * API Documentation: https://remotive.com/api-documentation
 * Fetches from multiple categories to get more diverse jobs
 */
const fetchRemotiveJobs = async () => {
  try {
    // Remotive API categories for diverse job listings
    const categories = ['software-dev', 'design', 'marketing', 'sales', 'product', 'data', 'business'];
    
    let allJobs = [];

    // Fetch jobs from multiple categories (in parallel for better performance)
    const categoryPromises = categories.map(async (category) => {
      try {
        const response = await axios.get('https://remotive.com/api/remote-jobs', {
          params: {
            limit: 50, // Increased limit per category
            category: category
          },
          timeout: 15000 // 15 second timeout per request
        });

        // Normalize Remotive API response to our common format
        const jobs = (response.data.jobs || []).map((job) => {
          // Determine if the listing is likely an internship
          const isIntern = /intern/i.test(job.title || '') || /intern/i.test(job.description || '');
          return {
            id: `remotive-${job.id}`,
            title: job.title || 'Untitled Position',
            company: job.company_name || 'Company Not Specified',
            location: job.candidate_required_location || 'Remote',
            type: isIntern ? 'Internship' : 'Job',
            description: stripHtml(job.description) || 'No description available',
            applyLink: job.url || '#',
            applyUrl: job.url || '#',
            source: 'external', // unified marker used by frontend
            sourceName: 'Remotive', // Human-friendly source label
            externalId: `remotive-${job.id}`,
            publishedDate: job.publication_date || new Date().toISOString()
          };
        });

        return jobs;
      } catch (error) {
        console.error(`Error fetching Remotive jobs for category ${category}:`, error.message);
        return []; // Return empty array if one category fails
      }
    });

    // Wait for all category requests to complete
    const results = await Promise.all(categoryPromises);
    
    // Flatten array of arrays into single array
    allJobs = results.flat();

    // Remove duplicates based on externalId
    const uniqueJobs = [];
    const seenIds = new Set();
    allJobs.forEach(job => {
      if (!seenIds.has(job.externalId)) {
        seenIds.add(job.externalId);
        uniqueJobs.push(job);
      }
    });

    console.log(`Fetched ${uniqueJobs.length} unique jobs from Remotive API`);
    return uniqueJobs;
  } catch (error) {
    console.error('Error fetching Remotive jobs:', error.message);
    return []; // Return empty array on error
  }
};

/**
 * Fetch jobs from JSearch API (Free tier available via RapidAPI)
 * Note: This requires RapidAPI key - commented out by default
 * Uncomment and add RAPIDAPI_KEY to .env to use
 */
const fetchJSearchJobs = async () => {
  try {
    // JSearch API endpoint - requires RapidAPI key
    // Uncomment below and add RAPIDAPI_KEY to .env file
    /*
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    if (!RAPIDAPI_KEY) {
      console.log('RAPIDAPI_KEY not found, skipping JSearch');
      return [];
    }

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: 'developer OR designer OR marketer',
        page: '1',
        num_pages: '3',
        employment_types: 'FULLTIME,INTERN'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      timeout: 15000
    });

    const jobs = (response.data.data || []).map((job) => ({
      title: job.job_title || 'Untitled Position',
      company: job.employer_name || 'Company Not Specified',
      location: job.job_city || job.job_country || 'Remote',
      type: job.job_is_remote ? 'Job' : 'Job',
      description: stripHtml(job.job_description || job.job_highlights?.items?.join(' ') || ''),
      applyLink: job.job_apply_link || '#',
      source: 'jsearch',
      externalId: `jsearch-${job.job_id}`,
      publishedDate: job.job_posted_at_datetime_utc || new Date().toISOString()
    }));

    return jobs;
    */
    return []; // Return empty array if not configured
  } catch (error) {
    console.error('Error fetching JSearch jobs:', error.message);
    return [];
  }
};

/**
 * Fetch jobs from Arbeitnow Job Board API (free public job board)
 * API Docs: https://www.arbeitnow.com/api/job-board-api
 */
const fetchArbeitnowJobs = async () => {
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
      timeout: 15000
    });

    // The API returns a `data` array with job objects
    const jobs = (response.data.data || []).map((job, idx) => {
      const title = job.title || 'Untitled Position';
      const isIntern = /intern/i.test(title) || /intern/i.test(job.description || '') || (job.tags || []).some(t => /intern/i.test(t));
      return {
        id: `arbeitnow-${job.slug || idx}`,
        title,
        company: job.company_name || job.company || 'Company Not Specified',
        location: job.location || (job.remote ? 'Remote' : 'Not specified'),
        type: isIntern ? 'Internship' : 'Job',
        description: stripHtml(job.description) || 'No description available',
        applyLink: job.url || job.remote_url || '#',
        applyUrl: job.url || job.remote_url || '#',
        source: 'external',
        sourceName: 'Arbeitnow',
        externalId: `arbeitnow-${job.slug || idx}`,
        publishedDate: job.created_at || new Date().toISOString()
      };
    });

    console.log(`Fetched ${jobs.length} jobs from Arbeitnow API`);
    return jobs;
  } catch (error) {
    console.error('Error fetching Arbeitnow jobs:', error.message);
    return [];
  }
};

/**
 * Fetch jobs from all external sources
 * Combines results from Remotive, JSearch, etc.
 */
const fetchExternalJobs = async (useCache = true) => {
  // Check cache first
  if (useCache && jobsCache && jobsCache.expiresAt > new Date()) {
    console.log('Returning cached external jobs');
    return jobsCache.data;
  }

  try {
    console.log('Fetching fresh external jobs from APIs...');
    
    // Fetch from multiple sources in parallel (Remotive + Arbeitnow + optional JSearch)
    const [remotiveJobs, arbeitnowJobs, jsearchJobs] = await Promise.all([
      fetchRemotiveJobs(),
      fetchArbeitnowJobs(),
      fetchJSearchJobs() // Returns empty array if not configured
    ]);

    // Combine all jobs
    const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...jsearchJobs];

    // Filter to India-only jobs and normalize city/applyPlatform where possible
    const indiaOnly = allJobs.filter(job => {
      return isIndiaLocation(job.location || job.candidate_required_location || job.location || '');
    }).map(job => {
      const city = normalizeCity(job.location || job.candidate_required_location || job.location || '');

      // Detect known Indian platforms from apply links
      const applyUrl = job.applyUrl || job.applyLink || job.url || '';
      let applyPlatform = null;
      if (/internshala\.com/i.test(applyUrl)) applyPlatform = 'Internshala';
      else if (/unstop\.com/i.test(applyUrl)) applyPlatform = 'Unstop';
      else if (/careers\.microsoft\.com|microsoft\.com\/career/i.test(applyUrl)) applyPlatform = 'Microsoft';

      return {
        id: job.id || job.externalId || job.external_id,
        title: job.title,
        company: job.company,
        city,
        type: job.type === 'Internship' ? 'Internship' : 'Job',
        description: job.description,
        applyUrl: applyUrl || '#',
        applyPlatform,
        isVerified: !!applyPlatform,
        source: 'External',
        sourceName: job.sourceName || job.source || 'External',
        publishedDate: job.publishedDate
      };
    });

    // Mark all as external source
    // Use indiaOnly normalized array
    const normalizedJobs = indiaOnly;

    // Update cache
    jobsCache = {
      data: normalizedJobs,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + CACHE_DURATION)
    };

    console.log(`Fetched ${normalizedJobs.length} total external jobs`);
    return normalizedJobs;
  } catch (error) {
    console.error('Error fetching external jobs:', error.message);
    // Return cached data if available, even if expired
    if (jobsCache && jobsCache.data) {
      console.log('Returning expired cache due to error');
      return jobsCache.data;
    }
    return []; // Return empty array on error
  }
};

/**
 * Clear the cache (useful for testing or manual refresh)
 */
const clearCache = () => {
  jobsCache = null;
  console.log('External jobs cache cleared');
};

module.exports = {
  fetchExternalJobs,
  fetchRemotiveJobs,
  fetchJSearchJobs,
  clearCache
};

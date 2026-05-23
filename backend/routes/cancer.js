const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const {
  getGlobalCancerStats,
  getCancerBurdenData,
  searchCancerType,
  getWHOBaselineStats,
  CANCER_REGISTRY
} = require('../config/bigquery');

// @route   GET /api/cancer/overview
// @desc    Get global cancer overview (WHO baseline + BigQuery if available)
// @access  Private
router.get('/overview', auth, async (req, res) => {
  try {
    // Always return verified WHO/GLOBOCAN 2022 baseline data
    const whoData = getWHOBaselineStats();
    
    // Attempt BigQuery query for supplemental data
    let bigqueryData = null;
    let bigqueryError = null;
    
    try {
      const result = await getGlobalCancerStats();
      if (result.success) {
        bigqueryData = result.data;
      } else {
        bigqueryError = result.error;
      }
    } catch (err) {
      bigqueryError = err.message;
      console.warn('BigQuery unavailable, using WHO baseline data:', err.message);
    }

    res.json({
      success: true,
      data: {
        who_globocan: whoData,
        bigquery_live: bigqueryData,
        bigquery_error: bigqueryError,
        cancer_types_available: Object.keys(CANCER_REGISTRY)
      }
    });
  } catch (error) {
    console.error('Cancer overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cancer overview data.'
    });
  }
});

// @route   GET /api/cancer/search?q=lung
// @desc    Search for a specific cancer type
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters.'
      });
    }

    const searchTerm = q.trim().toLowerCase();
    
    // Save to user's search history
    await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          searchHistory: {
            $each: [{ term: searchTerm }],
            $slice: -20 // Keep last 20 searches
          }
        }
      },
      { new: false }
    );

    // Get cancer data
    const lang = req.query.lang || 'en';
    const result = await searchCancerType(searchTerm, lang);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error,
        suggestions: result.suggestions
      });
    }

    // Augment with WHO GLOBOCAN data for this specific cancer
    const whoData = getWHOBaselineStats();
    const cancerName = result.cancerInfo.name.toLowerCase();
    
    // Find matching WHO data
    const whoMatch = whoData.global.most_common_cancers.find(c => 
      cancerName.includes(c.name.toLowerCase()) || 
      c.name.toLowerCase().includes(result.cancerType)
    );

    res.json({
      success: true,
      data: {
        cancer_type: result.cancerType,
        cancer_info: result.cancerInfo,
        who_stats: whoMatch ? {
          global_new_cases: whoMatch.new_cases,
          global_deaths: whoMatch.deaths,
          world_rank: whoMatch.rank,
          icd10: whoMatch.icd10,
          source: 'WHO/IARC GLOBOCAN 2022'
        } : {
          note: 'See WHO GLOBOCAN 2022 for complete statistics',
          source: 'WHO/IARC GLOBOCAN 2022'
        },
        bigquery_data: result.globalData,
        searched_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Cancer search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cancer data.'
    });
  }
});

// @route   GET /api/cancer/types
// @desc    Get list of all available cancer types
// @access  Private
router.get('/types', auth, (req, res) => {
  const types = Object.entries(CANCER_REGISTRY).map(([key, info]) => ({
    key,
    name: info.name,
    icd10: info.icd10,
    survival_rate: info.survival_rate_5yr
  }));

  res.json({
    success: true,
    data: types,
    total: types.length
  });
});

// @route   GET /api/cancer/stats/bigquery
// @desc    Run live BigQuery query for cancer mortality data
// @access  Private
router.get('/stats/bigquery', auth, async (req, res) => {
  try {
    const result = await getCancerBurdenData();
    
    if (!result.success) {
      return res.status(503).json({
        success: false,
        message: 'BigQuery is not configured or unavailable.',
        error: result.error,
        setup_instructions: {
          step1: 'Create a Google Cloud Platform project',
          step2: 'Enable the BigQuery API',
          step3: 'Create a service account with BigQuery Data Viewer role',
          step4: 'Download the JSON key file',
          step5: 'Set GOOGLE_APPLICATION_CREDENTIALS in .env to the key file path',
          step6: 'Set BIGQUERY_PROJECT_ID in .env to your GCP project ID',
          dataset_option: 'Load GBD cancer data from https://ghdx.healthdata.org/gbd-results-tool'
        }
      });
    }

    res.json({
      success: true,
      data: result.data,
      note: result.note,
      rows_returned: result.data.length,
      source: 'Google BigQuery - World Bank Health Population Dataset'
    });
  } catch (error) {
    console.error('BigQuery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'BigQuery query failed.',
      error: error.message
    });
  }
});

// @route   GET /api/cancer/user/history
// @desc    Get user's search history
// @access  Private
router.get('/user/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('searchHistory');
    res.json({
      success: true,
      history: user.searchHistory.reverse().slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve search history.' });
  }
});

module.exports = router;

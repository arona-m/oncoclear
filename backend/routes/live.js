const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { bigquery } = require('../config/bigquery');

const PROJECT = process.env.BIGQUERY_PROJECT_ID;
const DATASET = 'bigquery-public-data.world_bank_health_population.health_nutrition_population';

// Helper to run a BigQuery query safely
async function runQuery(query) {
  try {
    const [rows] = await bigquery.query({ query });
    return { success: true, data: rows };
  } catch (err) {
    console.error('BigQuery query error:', err.message);
    return { success: false, error: err.message };
  }
}



// @route GET /api/live/top-countries?year=2019
// Top countries by NCD (cancer-inclusive) mortality rate
router.get('/top-countries', auth, async (req, res) => {
  const year = parseInt(req.query.year) || 2019;

  const query = `
    SELECT
      country_name,
      country_code,
      ROUND(CAST(value AS FLOAT64), 2) AS mortality_rate,
      CAST(year AS INT64) AS year
    FROM \`${DATASET}\`
    WHERE
      indicator_code = 'SH.DYN.NCOM.ZS'
      AND year = ${year}
      AND value IS NOT NULL
      AND country_code NOT IN ('WLD','ECS','ECA','LCN','SSF','SAS','EAP','MEA','NAC','OED','HPC','LDC')
    ORDER BY mortality_rate DESC
    LIMIT 20
  `;

  const result = await runQuery(query);
  if (!result.success) return res.status(500).json({ success: false, error: result.error });

  res.json({
    success: true,
    query_type: 'top-countries',
    year,
    label: 'NCD Mortality Rate (%) — includes cancer, cardiovascular, diabetes',
    source: 'World Bank Health Population · BigQuery Public Data',
    data: result.data
  });
});

// @route GET /api/live/country-trend?country=USA
// NCD mortality trend over years for a single country
router.get('/country-trend', auth, async (req, res) => {
  const country = req.query.country || 'USA';

  const query = `
    SELECT
      country_name,
      country_code,
      CAST(year AS INT64) AS year,
      ROUND(CAST(value AS FLOAT64), 2) AS mortality_rate
    FROM \`${DATASET}\`
    WHERE
      indicator_code = 'SH.DYN.NCOM.ZS'
      AND country_code = '${country.toUpperCase().replace(/[^A-Z]/g, '')}'
      AND value IS NOT NULL
    ORDER BY year ASC
  `;

  const result = await runQuery(query);
  if (!result.success) return res.status(500).json({ success: false, error: result.error });
  if (!result.data.length) {
    return res.status(404).json({ success: false, error: `No data found for country code "${country}". Use ISO 3-letter codes like USA, GBR, DEU, FRA, CHN, IND.` });
  }

  res.json({
    success: true,
    query_type: 'country-trend',
    country: result.data[0]?.country_name || country,
    label: 'NCD Mortality Rate (%) over time',
    source: 'World Bank Health Population · BigQuery Public Data',
    data: result.data
  });
});

// @route GET /api/live/year-comparison?year=2019
// Compare all regions for a given year
router.get('/year-comparison', auth, async (req, res) => {
  const year = parseInt(req.query.year) || 2019;

  const query = `
    SELECT
      country_name AS region,
      country_code,
      ROUND(CAST(value AS FLOAT64), 2) AS mortality_rate,
      CAST(year AS INT64) AS year
    FROM \`${DATASET}\`
    WHERE
      indicator_code = 'SH.DYN.NCOM.ZS'
      AND year = ${year}
      AND value IS NOT NULL
      AND country_code IN ('WLD','ECS','LCN','SSF','SAS','EAP','MEA','NAC')
    ORDER BY mortality_rate DESC
  `;

  const result = await runQuery(query);
  if (!result.success) return res.status(500).json({ success: false, error: result.error });

  res.json({
    success: true,
    query_type: 'year-comparison',
    year,
    label: 'NCD Mortality Rate (%) by World Region',
    source: 'World Bank Health Population · BigQuery Public Data',
    data: result.data
  });
});

// @route GET /api/live/global-trend
// Global average NCD mortality trend across all years
router.get('/global-trend', auth, async (req, res) => {
  const query = `
    SELECT
      CAST(year AS INT64) AS year,
      ROUND(AVG(CAST(value AS FLOAT64)), 2) AS avg_mortality_rate,
      COUNT(DISTINCT country_code) AS countries_reported
    FROM \`${DATASET}\`
    WHERE
      indicator_code = 'SH.DYN.NCOM.ZS'
      AND value IS NOT NULL
      AND country_code NOT IN ('WLD','ECS','ECA','LCN','SSF','SAS','EAP','MEA','NAC','OED','HPC','LDC')
    GROUP BY year
    ORDER BY year ASC
  `;

  const result = await runQuery(query);
  if (!result.success) return res.status(500).json({ success: false, error: result.error });

  res.json({
    success: true,
    query_type: 'global-trend',
    label: 'Global Average NCD Mortality Rate (%) over time',
    source: 'World Bank Health Population · BigQuery Public Data',
    data: result.data
  });
});

// @route GET /api/live/available-years
// Get list of available years in the dataset
router.get('/available-years', auth, async (req, res) => {
  const query = `
    SELECT DISTINCT CAST(year AS INT64) AS year
    FROM \`${DATASET}\`
    WHERE indicator_code = 'SH.DYN.NCOM.ZS' AND value IS NOT NULL
    ORDER BY year DESC
  `;

  const result = await runQuery(query);
  if (!result.success) return res.status(500).json({ success: false, error: result.error });

  res.json({
    success: true,
    years: result.data.map(r => r.year)
  });
});

module.exports = router;

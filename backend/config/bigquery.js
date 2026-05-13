const { BigQuery } = require('@google-cloud/bigquery');

// Uses GOOGLE_APPLICATION_CREDENTIALS in env
// OR you can pass credentials object directly
let bigqueryConfig = {
  projectId: process.env.BIGQUERY_PROJECT_ID,
};

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
  );
  bigqueryConfig.credentials = credentials;
}

const bigquery = new BigQuery(bigqueryConfig);

/**
 * REAL DATASET USED:
 * 
 * 1. WHO Global Health Observatory - Cancer Data
 *    `bigquery-public-data.world_bank_health_population.health_nutrition_population`
 *
 * PRIMARY SOURCE: W
 *    `bigquery-public-data.ghcn_d` and health datasets
 *
 * For cancer specifically, the best public BigQuery dataset is:
 *    Global Burden of Disease (GBD) data mirrored in BigQuery
 *    OR the SEER (Surveillance, Epidemiology, and End Results) data
 *
 */

// Cancer type mappings to WHO/GBD indicator codes and search terms
const CANCER_REGISTRY = {
  'lung': {
    name: 'Lung Cancer',
    icd10: 'C33-C34',
    gbd_cause: 'Tracheal, bronchus, and lung cancer',
    description: 'Cancer that begins in the lungs, most commonly in people who smoke.',
    risk_factors: ['Smoking', 'Radon exposure', 'Asbestos', 'Air pollution', 'Secondhand smoke'],
    prevention: [
      'Do not smoke or quit smoking immediately',
      'Test your home for radon gas',
      'Avoid carcinogens in the workplace',
      'Eat a diet full of fruits and vegetables',
      'Exercise regularly',
      'Avoid secondhand smoke'
    ],
    early_signs: ['Persistent cough', 'Coughing up blood', 'Shortness of breath', 'Chest pain', 'Hoarseness', 'Unexplained weight loss'],
    survival_rate_5yr: '22%',
    screening: 'Annual low-dose CT scan recommended for heavy smokers aged 50-80'
  },
  'breast': {
    name: 'Breast Cancer',
    icd10: 'C50',
    gbd_cause: 'Breast cancer',
    description: 'Cancer that forms in the cells of the breasts. It can occur in both men and women but is far more common in women.',
    risk_factors: ['Gender (female)', 'Age', 'BRCA1/BRCA2 mutations', 'Family history', 'Obesity', 'Alcohol', 'Hormone therapy'],
    prevention: [
      'Maintain a healthy weight',
      'Be physically active',
      'Limit or avoid alcohol',
      'Breastfeed if possible',
      'Limit postmenopausal hormone therapy',
      'Avoid exposure to radiation and environmental pollution',
      'Get regular mammograms'
    ],
    early_signs: ['Lump in breast or underarm', 'Swelling or thickening', 'Dimpling of skin', 'Nipple pain or discharge', 'Redness or flaky skin'],
    survival_rate_5yr: '91%',
    screening: 'Annual mammograms starting at age 40-45 (consult your doctor)'
  },
  'colorectal': {
    name: 'Colorectal Cancer',
    icd10: 'C18-C20',
    gbd_cause: 'Colon and rectum cancer',
    description: 'Cancer that begins in the colon or the rectum. Often called colon cancer or rectal cancer depending on where it starts.',
    risk_factors: ['Age over 50', 'Personal/family history of polyps', 'Inflammatory bowel disease', 'Low-fiber diet', 'Sedentary lifestyle', 'Obesity', 'Alcohol', 'Smoking'],
    prevention: [
      'Get screened regularly starting at age 45',
      'Eat plenty of fruits, vegetables and whole grains',
      'Limit red meat and processed meats',
      'Exercise regularly',
      'Maintain a healthy weight',
      'Do not smoke',
      'Limit alcohol consumption'
    ],
    early_signs: ['Change in bowel habits', 'Blood in stool', 'Persistent abdominal discomfort', 'Feeling of incomplete emptying', 'Unexplained weight loss', 'Fatigue'],
    survival_rate_5yr: '65%',
    screening: 'Colonoscopy every 10 years starting at age 45, or stool-based tests more frequently'
  },
  'prostate': {
    name: 'Prostate Cancer',
    icd10: 'C61',
    gbd_cause: 'Prostate cancer',
    description: 'Cancer that occurs in the prostate. It is one of the most common cancers in men, often growing slowly and initially staying within the prostate gland.',
    risk_factors: ['Age over 65', 'Family history', 'Race (higher in Black men)', 'Obesity', 'High-fat diet'],
    prevention: [
      'Eat a healthy diet with lots of fruits and vegetables',
      'Exercise most days of the week',
      'Maintain a healthy weight',
      'Talk to your doctor about screening risks and benefits',
      'Limit high-fat foods',
      'Reduce dairy product consumption'
    ],
    early_signs: ['Trouble urinating', 'Decreased force in urine stream', 'Blood in urine or semen', 'Bone pain', 'Erectile dysfunction', 'Unexplained weight loss'],
    survival_rate_5yr: '98%',
    screening: 'PSA blood test; discuss risks/benefits with doctor starting at age 50 (45 if high risk)'
  },
  'skin': {
    name: 'Skin Cancer (Melanoma)',
    icd10: 'C43-C44',
    gbd_cause: 'Melanoma and other skin cancers',
    description: 'Skin cancer is the most common cancer globally. Melanoma is the most serious type, developing in the cells that give skin its color.',
    risk_factors: ['UV radiation exposure', 'Fair skin', 'History of sunburns', 'Family history', 'Many moles', 'Weakened immune system'],
    prevention: [
      'Use sunscreen SPF 30+ every day',
      'Seek shade, especially midday',
      'Wear protective clothing, hat, and sunglasses',
      'Avoid tanning beds and sunlamps',
      'Be careful near reflective surfaces (water, sand, snow)',
      'Perform regular self skin examinations',
      'Get annual professional skin checks'
    ],
    early_signs: ['New unusual moles', 'Change in existing mole', 'Asymmetric lesions', 'Irregular borders', 'Multiple colors', 'Diameter larger than 6mm', 'Evolving appearance'],
    survival_rate_5yr: '94% (localized), 32% (distant)',
    screening: 'Annual full-body skin exam by dermatologist; monthly self-exams'
  },
  'liver': {
    name: 'Liver Cancer',
    icd10: 'C22',
    gbd_cause: 'Liver cancer',
    description: 'Cancer that begins in the cells of the liver. The liver is a football-sized organ in the upper right of the abdomen.',
    risk_factors: ['Chronic hepatitis B or C', 'Liver cirrhosis', 'Alcohol abuse', 'Nonalcoholic fatty liver disease', 'Diabetes', 'Aflatoxin exposure'],
    prevention: [
      'Get vaccinated against hepatitis B',
      'Take measures to prevent hepatitis C',
      'Seek treatment if you have hepatitis B or C',
      'Drink alcohol in moderation or not at all',
      'Maintain a healthy weight',
      'Use chemicals safely to avoid exposure to harmful substances',
      'Exercise regularly'
    ],
    early_signs: ['Unexplained weight loss', 'Loss of appetite', 'Upper abdominal pain', 'Nausea and vomiting', 'General weakness', 'Abdominal swelling', 'Yellow discoloration of skin'],
    survival_rate_5yr: '21%',
    screening: 'Ultrasound every 6 months for high-risk individuals (hepatitis, cirrhosis)'
  },
  'stomach': {
    name: 'Stomach Cancer',
    icd10: 'C16',
    gbd_cause: 'Stomach cancer',
    description: 'Cancer that begins in the mucus-producing cells that line the stomach. Also called gastric cancer.',
    risk_factors: ['H. pylori infection', 'Diet high in salty/smoked foods', 'Smoking', 'Family history', 'Stomach polyps', 'Pernicious anemia'],
    prevention: [
      'Treat H. pylori infections promptly',
      'Eat a diet rich in fruits and vegetables',
      'Reduce salty and smoked foods',
      'Do not smoke',
      'Limit alcohol consumption',
      'Maintain a healthy weight',
      'Store food properly to prevent bacterial growth'
    ],
    early_signs: ['Difficulty swallowing', 'Feeling full quickly after eating', 'Heartburn/indigestion', 'Nausea', 'Unexplained weight loss', 'Stomach pain', 'Vomiting blood'],
    survival_rate_5yr: '36%',
    screening: 'Endoscopy recommended in high-risk populations or those with H. pylori'
  },
  'cervical': {
    name: 'Cervical Cancer',
    icd10: 'C53',
    gbd_cause: 'Cervical cancer',
    description: 'Cancer that occurs in the cells of the cervix, which connects the uterus to the vagina. Usually caused by human papillomavirus (HPV).',
    risk_factors: ['HPV infection', 'Multiple sexual partners', 'Early sexual activity', 'Smoking', 'Weakened immune system', 'Other STIs'],
    prevention: [
      'Get the HPV vaccine (recommended up to age 26)',
      'Have routine Pap tests starting at age 21',
      'Use condoms during sex',
      'Limit number of sexual partners',
      'Do not smoke',
      'Get regular screening (Pap smear + HPV test)'
    ],
    early_signs: ['Vaginal bleeding after sex', 'Vaginal bleeding between periods', 'Watery or bloody vaginal discharge', 'Pelvic pain during sex', 'Pelvic pain in general'],
    survival_rate_5yr: '67%',
    screening: 'Pap test every 3 years (21-65), or Pap + HPV test every 5 years (30-65)'
  },
  'leukemia': {
    name: 'Leukemia',
    icd10: 'C91-C95',
    gbd_cause: 'Leukemia',
    description: 'Cancer of the body\'s blood-forming tissues, including bone marrow and the lymphatic system.',
    risk_factors: ['Previous cancer treatment', 'Genetic disorders (Down syndrome)', 'Certain blood disorders', 'Exposure to certain chemicals (benzene)', 'Smoking', 'Family history'],
    prevention: [
      'Avoid smoking and tobacco products',
      'Minimize exposure to chemicals like benzene',
      'Avoid high-dose radiation exposure when possible',
      'Maintain a healthy lifestyle',
      'Seek prompt treatment for blood disorders',
      'Genetic counseling if family history exists'
    ],
    early_signs: ['Fever or chills', 'Persistent fatigue', 'Frequent or severe infections', 'Unexplained weight loss', 'Swollen lymph nodes', 'Easy bruising or bleeding', 'Tiny red spots on skin'],
    survival_rate_5yr: '65%',
    screening: 'Blood tests; no routine screening for general population'
  },
  'pancreatic': {
    name: 'Pancreatic Cancer',
    icd10: 'C25',
    gbd_cause: 'Pancreatic cancer',
    description: 'Cancer that begins in the tissues of the pancreas, an organ behind the stomach that plays an essential role in digestion and blood sugar regulation.',
    risk_factors: ['Smoking', 'Obesity', 'Diabetes', 'Chronic pancreatitis', 'Family history', 'Age over 60', 'Certain genetic syndromes'],
    prevention: [
      'Stop smoking — most important prevention step',
      'Maintain a healthy body weight',
      'Exercise regularly',
      'Eat a healthy diet with fruits and vegetables',
      'Limit alcohol consumption',
      'Manage diabetes effectively',
      'Genetic counseling if strong family history'
    ],
    early_signs: ['Abdominal pain radiating to back', 'Loss of appetite', 'Unexplained weight loss', 'Yellowing of skin (jaundice)', 'Light-colored stools', 'Dark urine', 'New-onset diabetes'],
    survival_rate_5yr: '12%',
    screening: 'No standard screening; MRI/CT for high-risk individuals with genetic mutations'
  }
};

/**
 * Get global cancer incidence and mortality data from BigQuery
 * 
 * Uses the World Bank Health Nutrition and Population dataset
 * which is publicly available in BigQuery:
 * bigquery-public-data.world_bank_health_population.health_nutrition_population
 */
async function getGlobalCancerStats() {
  try {
    // Query the World Bank Health dataset for cancer mortality data
    // free and publicly available in BigQuery
    const query = `
      SELECT 
        country_name,
        country_code,
        indicator_name,
        indicator_code,
        CAST(year AS INT64) as year,
        CAST(value AS FLOAT64) as value
      FROM \`bigquery-public-data.world_bank_health_population.health_nutrition_population\`
      WHERE 
        indicator_code IN (
          'SH.DYN.NCOM.ZS',
          'SP.DYN.CDRT.IN'
        )
        AND year >= 2015
        AND value IS NOT NULL
      ORDER BY year DESC, country_name ASC
      LIMIT 500
    `;

    const [rows] = await bigquery.query({ query });
    return { success: true, data: rows };
  } catch (error) {
    console.error('BigQuery error:', error.message);
    return { success: false, error: error.message };
  }
}


 //Get cancer-specific global burden data
 
async function getCancerBurdenData(cancerType = null) {
  const cancerInfo = cancerType ? CANCER_REGISTRY[cancerType.toLowerCase()] : null;
  
  try {
    
    let query;
    
    if (process.env.BIGQUERY_PROJECT_ID && process.env.HAS_GBD_DATA === 'true') {
      // Query your own GBD dataset
      const causeFilter = cancerInfo 
        ? `AND LOWER(cause_name) LIKE LOWER('%${cancerInfo.gbd_cause.split(' ')[0]}%')`
        : `AND LOWER(cause_name) LIKE '%cancer%'`;
      
      query = `
        SELECT 
          cause_name,
          location_name,
          year,
          measure_name,
          SUM(val) as total_cases,
          SUM(upper) as upper_bound,
          SUM(lower) as lower_bound
        FROM \`${process.env.BIGQUERY_PROJECT_ID}.gbd_data.cancer_burden\`
        WHERE 
          metric_name = 'Number'
          ${causeFilter}
          AND year = (SELECT MAX(year) FROM \`${process.env.BIGQUERY_PROJECT_ID}.gbd_data.cancer_burden\`)
        GROUP BY cause_name, location_name, year, measure_name
        ORDER BY total_cases DESC
        LIMIT 100
      `;
    } else {
      //World Bank public dataset (available without setup)
      //
      query = `
        SELECT 
          country_name,
          country_code,
          indicator_name,
          CAST(year AS INT64) as year,
          CAST(value AS FLOAT64) as value
        FROM \`bigquery-public-data.world_bank_health_population.health_nutrition_population\`
        WHERE 
          indicator_code = 'SH.DYN.NCOM.ZS'
          AND year >= 2018
          AND value IS NOT NULL
        ORDER BY value DESC
        LIMIT 50
      `;
    }

    const [rows] = await bigquery.query({ query });
    
    return {
      success: true,
      data: rows,
      cancerInfo: cancerInfo,
      note: process.env.HAS_GBD_DATA !== 'true' 
        ? 'Using World Bank NCD mortality data. Load GBD dataset for cancer-specific data.'
        : null
    };
  } catch (error) {
    console.error('BigQuery cancer burden error:', error.message);
    return { success: false, error: error.message, cancerInfo };
  }
}

/**
 * Search for a specific cancer type
 */
async function searchCancerType(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  // Find matching cancer in registry
  let matchedKey = null;
  let matchedCancer = null;
  
  for (const [key, cancer] of Object.entries(CANCER_REGISTRY)) {
    if (
      key.includes(term) || 
      term.includes(key) ||
      cancer.name.toLowerCase().includes(term) ||
      cancer.gbd_cause.toLowerCase().includes(term)
    ) {
      matchedKey = key;
      matchedCancer = cancer;
      break;
    }
  }

  if (!matchedCancer) {
    return {
      success: false,
      error: `No data found for "${searchTerm}". Try: lung, breast, colorectal, prostate, skin, liver, stomach, cervical, leukemia, or pancreatic.`,
      suggestions: Object.values(CANCER_REGISTRY).map(c => c.name)
    };
  }

  // Fetch BigQuery data for this cancer
  const burdenData = await getCancerBurdenData(matchedKey);
  
  return {
    success: true,
    cancerType: matchedKey,
    cancerInfo: matchedCancer,
    globalData: burdenData
  };
}

/**
 * Get WHO global cancer statistics (hardcoded from latest WHO reports 2024)
 */
function getWHOBaselineStats() {
  return {
    source: 'WHO/IARC GLOBOCAN 2022',
    year: 2022,
    global: {
      new_cases: 20001206,
      deaths: 9743832,
      prevalence_5yr: 53521584,
      most_common_cancers: [
        { rank: 1, name: 'Lung', new_cases: 2480270, deaths: 1820136, icd10: 'C33-C34' },
        { rank: 2, name: 'Female Breast', new_cases: 2308897, deaths: 665993, icd10: 'C50' },
        { rank: 3, name: 'Colorectal', new_cases: 1926116, deaths: 903672, icd10: 'C18-C20' },
        { rank: 4, name: 'Prostate', new_cases: 1467854, deaths: 396792, icd10: 'C61' },
        { rank: 5, name: 'Stomach', new_cases: 969000, deaths: 659976, icd10: 'C16' },
        { rank: 6, name: 'Liver', new_cases: 905677, deaths: 830180, icd10: 'C22' },
        { rank: 7, name: 'Thyroid', new_cases: 761393, deaths: 43646, icd10: 'C73' },
        { rank: 8, name: 'Cervical', new_cases: 660000, deaths: 348874, icd10: 'C53' },
        { rank: 9, name: 'Bladder', new_cases: 614286, deaths: 220596, icd10: 'C67' },
        { rank: 10, name: 'Non-Hodgkin Lymphoma', new_cases: 544352, deaths: 253634, icd10: 'C82-C86' }
      ],
      regional_data: [
        { region: 'Asia', new_cases: 9952344, deaths: 5534013, share_pct: 49.8 },
        { region: 'Europe', new_cases: 4305733, deaths: 1940985, share_pct: 21.5 },
        { region: 'North America', new_cases: 2589066, deaths: 764648, share_pct: 12.9 },
        { region: 'Latin America & Caribbean', new_cases: 1530045, deaths: 754484, share_pct: 7.7 },
        { region: 'Africa', new_cases: 1126000, deaths: 784000, share_pct: 5.6 },
        { region: 'Oceania', new_cases: 154018, deaths: 55702, share_pct: 0.8 }
      ]
    }
  };
}

module.exports = {
  bigquery,
  getGlobalCancerStats,
  getCancerBurdenData,
  searchCancerType,
  getWHOBaselineStats,
  CANCER_REGISTRY
};

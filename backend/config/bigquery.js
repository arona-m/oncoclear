const { BigQuery } = require('@google-cloud/bigquery');

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

const CANCER_REGISTRY = {
  'lung': {
    name: 'Lung Cancer',
    name_sq: 'Kanceri i Mushkërive',
    icd10: 'C33-C34',
    gbd_cause: 'Tracheal, bronchus, and lung cancer',
    description: 'Cancer that begins in the lungs, most commonly in people who smoke.',
    description_sq: 'Kancer që fillon në mushkëri, më shpesh tek njerëzit që duhanpirin.',
    risk_factors: ['Smoking', 'Radon exposure', 'Asbestos', 'Air pollution', 'Secondhand smoke'],
    risk_factors_sq: ['Duhanpirja', 'Ekspozimi ndaj radonit', 'Azbestit', 'Ndotja e ajrit', 'Tymi pasiv'],
    prevention: [
      'Do not smoke or quit smoking immediately',
      'Test your home for radon gas',
      'Avoid carcinogens in the workplace',
      'Eat a diet full of fruits and vegetables',
      'Exercise regularly',
      'Avoid secondhand smoke'
    ],
    prevention_sq: [
      'Mos pini duhan ose lëreni duhanin menjëherë',
      'Testoni shtëpinë tuaj për gaz radon',
      'Shmangni kancerogjenet në vendin e punës',
      'Hani një dietë të pasur me fruta dhe perime',
      'Ushtrohuni rregullisht',
      'Shmangni tymin pasiv'
    ],
    early_signs: ['Persistent cough', 'Coughing up blood', 'Shortness of breath', 'Chest pain', 'Hoarseness', 'Unexplained weight loss'],
    early_signs_sq: ['Kollë e vazhdueshme', 'Kollitje gjaku', 'Vështirësi në frymëmarrje', 'Dhimbje gjoksi', 'Ndryshim i rëndë i zërit', 'Humbje peshe e pashpjegueshme'],
    survival_rate_5yr: '22%',
    screening: 'Annual low-dose CT scan recommended for heavy smokers aged 50-80',
    screening_sq: 'Skanim CT me dozë të ulët çdo vit rekomandohet për duhanpirësit e rëndë të moshës 50-80 vjeç'
  },
  'breast': {
    name: 'Breast Cancer',
    name_sq: 'Kanceri i Gjirit',
    icd10: 'C50',
    gbd_cause: 'Breast cancer',
    description: 'Cancer that forms in the cells of the breasts, far more common in women.',
    description_sq: 'Kancer që formohet në qelizat e gjirit, shumë më i zakonshëm tek gratë.',
    risk_factors: ['Gender (female)', 'Age', 'BRCA1/BRCA2 mutations', 'Family history', 'Obesity', 'Alcohol', 'Hormone therapy'],
    risk_factors_sq: ['Gjinia (femër)', 'Mosha', 'Mutacionet BRCA1/BRCA2', 'Historia familjare', 'Obeziteti', 'Alkooli', 'Terapia hormonale'],
    prevention: [
      'Maintain a healthy weight',
      'Be physically active',
      'Limit or avoid alcohol',
      'Breastfeed if possible',
      'Limit postmenopausal hormone therapy',
      'Get regular mammograms'
    ],
    prevention_sq: [
      'Ruani një peshë të shëndetshme',
      'Jini fizikisht aktiv',
      'Kufizoni ose shmangni alkoolin',
      'Ushqeni me gji nëse është e mundur',
      'Kufizoni terapinë hormonale pas menopauzës',
      'Bëni mamografi rregullisht'
    ],
    early_signs: ['Lump in breast or underarm', 'Swelling or thickening', 'Dimpling of skin', 'Nipple pain or discharge', 'Redness or flaky skin'],
    early_signs_sq: ['Gungë në gji ose nën sqetull', 'Fryrje ose trashje', 'Gropëzim i lëkurës', 'Dhimbje ose rrjedhje nga thithja', 'Skuqje ose lëkurë e krisur'],
    survival_rate_5yr: '91%',
    screening: 'Annual mammograms starting at age 40-45 (consult your doctor)',
    screening_sq: 'Mamografi vjetore duke filluar nga mosha 40-45 vjeç (konsultohuni me mjekun tuaj)'
  },
  'colorectal': {
    name: 'Colorectal Cancer',
    name_sq: 'Kanceri Kolorektal',
    icd10: 'C18-C20',
    gbd_cause: 'Colon and rectum cancer',
    description: 'Cancer that begins in the colon or the rectum.',
    description_sq: 'Kancer që fillon në zorrën e trashë ose në rektum.',
    risk_factors: ['Age over 50', 'Personal/family history of polyps', 'Inflammatory bowel disease', 'Low-fiber diet', 'Sedentary lifestyle', 'Obesity', 'Alcohol', 'Smoking'],
    risk_factors_sq: ['Mosha mbi 50', 'Historia personale/familjare e polipeve', 'Sëmundja inflamatore e zorrëve', 'Dietë me fibra të pakta', 'Stili i jetesës sedentare', 'Obeziteti', 'Alkooli', 'Duhanpirja'],
    prevention: [
      'Get screened regularly starting at age 45',
      'Eat plenty of fruits, vegetables and whole grains',
      'Limit red meat and processed meats',
      'Exercise regularly',
      'Maintain a healthy weight',
      'Do not smoke',
      'Limit alcohol consumption'
    ],
    prevention_sq: [
      'Bëni screening rregullisht duke filluar nga mosha 45 vjeç',
      'Hani shumë fruta, perime dhe drithëra të plota',
      'Kufizoni mishin e kuq dhe mishin e përpunuar',
      'Ushtrohuni rregullisht',
      'Ruani një peshë të shëndetshme',
      'Mos pini duhan',
      'Kufizoni konsumin e alkoolit'
    ],
    early_signs: ['Change in bowel habits', 'Blood in stool', 'Persistent abdominal discomfort', 'Feeling of incomplete emptying', 'Unexplained weight loss', 'Fatigue'],
    early_signs_sq: ['Ndryshim në zakone të zorrëve', 'Gjak në jashtëqitje', 'Shqetësim i vazhdueshëm abdominal', 'Ndjesi boshllëku të paplotë', 'Humbje peshe e pashpjegueshme', 'Lodhje'],
    survival_rate_5yr: '65%',
    screening: 'Colonoscopy every 10 years starting at age 45',
    screening_sq: 'Kolonoskopi çdo 10 vjet duke filluar nga mosha 45 vjeç'
  },
  'prostate': {
    name: 'Prostate Cancer',
    name_sq: 'Kanceri i Prostatës',
    icd10: 'C61',
    gbd_cause: 'Prostate cancer',
    description: 'Cancer that occurs in the prostate, one of the most common cancers in men.',
    description_sq: 'Kancer që ndodh në prostatë, një nga kanceret më të zakonshme tek burrat.',
    risk_factors: ['Age over 65', 'Family history', 'Race (higher in Black men)', 'Obesity', 'High-fat diet'],
    risk_factors_sq: ['Mosha mbi 65', 'Historia familjare', 'Raca (më e lartë tek burrat me ngjyrë)', 'Obeziteti', 'Dietë me yndyrë të lartë'],
    prevention: [
      'Eat a healthy diet with lots of fruits and vegetables',
      'Exercise most days of the week',
      'Maintain a healthy weight',
      'Talk to your doctor about screening',
      'Limit high-fat foods',
      'Reduce dairy product consumption'
    ],
    prevention_sq: [
      'Hani një dietë të shëndetshme me shumë fruta dhe perime',
      'Ushtrohuni shumicën e ditëve të javës',
      'Ruani një peshë të shëndetshme',
      'Bisedoni me mjekun tuaj rreth screeningut',
      'Kufizoni ushqimet me yndyrë të lartë',
      'Reduktoni konsumin e produkteve të qumështit'
    ],
    early_signs: ['Trouble urinating', 'Decreased force in urine stream', 'Blood in urine or semen', 'Bone pain', 'Erectile dysfunction'],
    early_signs_sq: ['Vështirësi në urinim', 'Ulje e forcës së rrjedhës së urinës', 'Gjak në urinë ose spermë', 'Dhimbje kockash', 'Mosfunksionim erektil'],
    survival_rate_5yr: '98%',
    screening: 'PSA blood test; discuss with doctor starting at age 50',
    screening_sq: 'Testi i gjakut PSA; diskutoni me mjekun duke filluar nga mosha 50 vjeç'
  },
  'skin': {
    name: 'Skin Cancer (Melanoma)',
    name_sq: 'Kanceri i Lëkurës (Melanoma)',
    icd10: 'C43-C44',
    gbd_cause: 'Melanoma and other skin cancers',
    description: 'The most common cancer globally. Melanoma is the most serious type.',
    description_sq: 'Kanceri më i zakonshëm globalisht. Melanoma është lloji më i rëndë.',
    risk_factors: ['UV radiation exposure', 'Fair skin', 'History of sunburns', 'Family history', 'Many moles', 'Weakened immune system'],
    risk_factors_sq: ['Ekspozimi ndaj rrezatimit UV', 'Lëkurë e hapur', 'Histori e djegieve nga dielli', 'Historia familjare', 'Shumë nishana', 'Sistemi imunitar i dobësuar'],
    prevention: [
      'Use sunscreen SPF 30+ every day',
      'Seek shade, especially midday',
      'Wear protective clothing, hat, and sunglasses',
      'Avoid tanning beds and sunlamps',
      'Perform regular self skin examinations',
      'Get annual professional skin checks'
    ],
    prevention_sq: [
      'Përdorni krem dielli SPF 30+ çdo ditë',
      'Kërkoni hije, veçanërisht në mes të ditës',
      'Vishni veshje mbrojtëse, kapelë dhe syze dielli',
      'Shmangni solaret dhe llampa dielli',
      'Bëni vetë-ekzaminime të rregullta të lëkurës',
      'Bëni kontrolle profesionale vjetore të lëkurës'
    ],
    early_signs: ['New unusual moles', 'Change in existing mole', 'Asymmetric lesions', 'Irregular borders', 'Multiple colors', 'Diameter larger than 6mm'],
    early_signs_sq: ['Nishane të reja të pazakonta', 'Ndryshim në nishanë ekzistuese', 'Lezion asimetrik', 'Kufij të parregullt të nishanit eksiztues', 'Ngjyra të shumta', 'Diametër më i madh se 6mm'],
    survival_rate_5yr: '94% (localized), 32% (distant)',
    screening: 'Annual full-body skin exam by dermatologist; monthly self-exams',
    screening_sq: 'Ekzaminim vjetor i plotë i lëkurës nga dermatologu; vetë-ekzaminime mujore'
  },
  'liver': {
    name: 'Liver Cancer',
    name_sq: 'Kanceri i Mëlçisë',
    icd10: 'C22',
    gbd_cause: 'Liver cancer',
    description: 'Cancer that begins in the cells of the liver.',
    description_sq: 'Kancer që fillon në qelizat e mëlçisë.',
    risk_factors: ['Chronic hepatitis B or C', 'Liver cirrhosis', 'Alcohol abuse', 'Nonalcoholic fatty liver disease', 'Diabetes', 'Aflatoxin exposure'],
    risk_factors_sq: ['Hepatiti kronik B ose C', 'Cirroza e mëlçisë', 'Abuzimi me alkool', 'Sëmundja e mëlçisë yndyrore jo-alkoolike', 'Diabeti', 'Ekspozimi ndaj aflatoksinës'],
    prevention: [
      'Get vaccinated against hepatitis B',
      'Take measures to prevent hepatitis C',
      'Seek treatment if you have hepatitis B or C',
      'Drink alcohol in moderation or not at all',
      'Maintain a healthy weight',
      'Exercise regularly'
    ],
    prevention_sq: [
      'Vaksinohuni kundër hepatitit B',
      'Merrni masa për të parandaluar hepatitin C',
      'Kërkoni trajtim nëse keni hepatit B ose C',
      'Pini alkool me moderim ose aspak',
      'Ruani një peshë të shëndetshme',
      'Ushtrohuni rregullisht'
    ],
    early_signs: ['Unexplained weight loss', 'Loss of appetite', 'Upper abdominal pain', 'Nausea and vomiting', 'General weakness', 'Yellow discoloration of skin'],
    early_signs_sq: ['Humbje peshe e pashpjegueshme', 'Humbje oreksi', 'Dhimbje abdominale e sipërme', 'Të përzierat dhe të vjella', 'Dobësi e përgjithshme', 'Verdhëz e lëkurës'],
    survival_rate_5yr: '21%',
    screening: 'Ultrasound every 6 months for high-risk individuals',
    screening_sq: 'Ultratingull çdo 6 muaj për individët me rrezik të lartë'
  },
  'stomach': {
    name: 'Stomach Cancer',
    name_sq: 'Kanceri i Stomakut',
    icd10: 'C16',
    gbd_cause: 'Stomach cancer',
    description: 'Cancer that begins in the mucus-producing cells that line the stomach.',
    description_sq: 'Kancer që fillon në qelizat prodhuese të mukusit që veshon stomakun.',
    risk_factors: ['H. pylori infection', 'Diet high in salty/smoked foods', 'Smoking', 'Family history', 'Stomach polyps'],
    risk_factors_sq: ['Infeksioni nga H. pylori', 'Dietë e pasur me ushqime të kripura/të tymosura', 'Duhanpirja', 'Historia familjare', 'Polipi stomakut'],
    prevention: [
      'Treat H. pylori infections promptly',
      'Eat a diet rich in fruits and vegetables',
      'Reduce salty and smoked foods',
      'Do not smoke',
      'Limit alcohol consumption',
      'Maintain a healthy weight'
    ],
    prevention_sq: [
      'Trajtoni menjëherë infeksionet nga H. pylori',
      'Hani një dietë të pasur me fruta dhe perime',
      'Reduktoni ushqimet e kripura dhe të tymosura',
      'Mos pini duhan',
      'Kufizoni konsumin e alkoolit',
      'Ruani një peshë të shëndetshme'
    ],
    early_signs: ['Difficulty swallowing', 'Feeling full quickly after eating', 'Heartburn/indigestion', 'Nausea', 'Unexplained weight loss', 'Stomach pain'],
    early_signs_sq: ['Vështirësi në gëlltitje', 'Ndjesi ngopjeje shpejt pas ngrënies', 'Djegie stomaku/dispepsi', 'Të përzierat', 'Humbje peshe e pashpjegueshme', 'Dhimbje stomaku'],
    survival_rate_5yr: '36%',
    screening: 'Endoscopy recommended in high-risk populations',
    screening_sq: 'Endoskopia rekomandohet në popullatat me rrezik të lartë'
  },
  'cervical': {
    name: 'Cervical Cancer',
    name_sq: 'Kanceri Cervikal',
    icd10: 'C53',
    gbd_cause: 'Cervical cancer',
    description: 'Cancer that occurs in the cells of the cervix, usually caused by HPV.',
    description_sq: 'Kancer që ndodh në qelizat e qafës së mitrës, zakonisht i shkaktuar nga HPV.',
    risk_factors: ['HPV infection', 'Multiple sexual partners', 'Early sexual activity', 'Smoking', 'Weakened immune system'],
    risk_factors_sq: ['Infeksioni nga HPV', 'Partnerë të shumtë seksualë', 'Aktivitet seksual i hershëm', 'Duhanpirja', 'Sistemi imunitar i dobësuar'],
    prevention: [
      'Get the HPV vaccine (recommended up to age 26)',
      'Have routine Pap tests starting at age 21',
      'Use condoms during sex',
      'Limit number of sexual partners',
      'Do not smoke'
    ],
    prevention_sq: [
      'Vaksinohuni kundër HPV (rekomandohet deri në moshën 26 vjeç)',
      'Bëni teste Pap rutinë duke filluar nga mosha 21 vjeç',
      'Përdorni prezervativë gjatë marrëdhënieve seksuale',
      'Kufizoni numrin e partnerëve seksualë',
      'Mos pini duhan'
    ],
    early_signs: ['Vaginal bleeding after sex', 'Vaginal bleeding between periods', 'Watery or bloody discharge', 'Pelvic pain during sex'],
    early_signs_sq: ['Gjakderdhje vaginale pas marrëdhënies seksuale', 'Gjakderdhje vaginale midis cikleve', 'Rrjedhje ujore ose me gjak', 'Dhimbje pelvike gjatë seksit'],
    survival_rate_5yr: '67%',
    screening: 'Pap test every 3 years (ages 21-65)',
    screening_sq: 'Test Pap çdo 3 vjet (mosha 21-65 vjeç)'
  },
  'leukemia': {
    name: 'Leukemia',
    name_sq: 'Leukemia',
    icd10: 'C91-C95',
    gbd_cause: 'Leukemia',
    description: 'Cancer of the body\'s blood-forming tissues, including bone marrow.',
    description_sq: 'Kancer i indeve formuese të gjakut të trupit, duke përfshirë palcën e kockave.',
    risk_factors: ['Previous cancer treatment', 'Genetic disorders (Down syndrome)', 'Exposure to benzene', 'Smoking', 'Family history'],
    risk_factors_sq: ['Trajtim i mëparshëm kundër kancerit', 'Çrregullime gjenetike (sindroma Down)', 'Ekspozimi ndaj benzenit', 'Duhanpirja', 'Historia familjare'],
    prevention: [
      'Avoid smoking and tobacco products',
      'Minimize exposure to chemicals like benzene',
      'Avoid high-dose radiation exposure',
      'Maintain a healthy lifestyle',
      'Genetic counseling if family history exists'
    ],
    prevention_sq: [
      'Shmangni duhan pirjen dhe produktet e duhanit',
      'Minimizoni ekspozimin ndaj kimikateve si benzeni',
      'Shmangni ekspozimin ndaj rrezatimit me dozë të lartë',
      'Ruani një stil jetese të shëndetshme',
      'Këshillim gjenetik nëse ekziston historia familjare'
    ],
    early_signs: ['Fever or chills', 'Persistent fatigue', 'Frequent infections', 'Unexplained weight loss', 'Swollen lymph nodes', 'Easy bruising or bleeding'],
    early_signs_sq: ['Ethe ose të dridhura', 'Lodhje e vazhdueshme', 'Infeksione të shpeshta', 'Humbje peshe e pashpjegueshme', 'Nyje limfatike të fryrë', 'Mavijosje ose gjakderdhje e lehtë'],
    survival_rate_5yr: '65%',
    screening: 'Blood tests; no routine screening for general population',
    screening_sq: 'Teste gjaku; nuk ka screening rutinë për popullatën e përgjithshme'
  },
  'pancreatic': {
    name: 'Pancreatic Cancer',
    name_sq: 'Kanceri Pankreatik',
    icd10: 'C25',
    gbd_cause: 'Pancreatic cancer',
    description: 'Cancer that begins in the tissues of the pancreas.',
    description_sq: 'Kancer që fillon në indet e pankreasit.',
    risk_factors: ['Smoking', 'Obesity', 'Diabetes', 'Chronic pancreatitis', 'Family history', 'Age over 60'],
    risk_factors_sq: ['Duhanpirja', 'Obeziteti', 'Diabeti', 'Pankreatiti kronik', 'Historia familjare', 'Mosha mbi 60'],
    prevention: [
      'Stop smoking — most important prevention step',
      'Maintain a healthy body weight',
      'Exercise regularly',
      'Eat a healthy diet with fruits and vegetables',
      'Limit alcohol consumption',
      'Manage diabetes effectively'
    ],
    prevention_sq: [
      'Lëreni duhanin — hapi më i rëndësishëm i parandalimit',
      'Ruani një peshë të shëndetshme trupore',
      'Ushtrohuni rregullisht',
      'Hani një dietë të shëndetshme me fruta dhe perime',
      'Kufizoni konsumin e alkoolit',
      'Menaxhoni diabetin efektivisht'
    ],
    early_signs: ['Abdominal pain radiating to back', 'Loss of appetite', 'Unexplained weight loss', 'Yellowing of skin (jaundice)', 'Light-colored stools', 'Dark urine'],
    early_signs_sq: ['Dhimbje abdominale që rrezaton në shpinë', 'Humbje oreksi', 'Humbje peshe e pashpjegueshme', 'Verdhëz e lëkurës (ikter)', 'Jashtëqitje me ngjyrë të çelët', 'Urinë e errët'],
    survival_rate_5yr: '12%',
    screening: 'No standard screening; MRI/CT for high-risk individuals',
    screening_sq: 'Nuk ka screening standard; MRI/CT për individët me rrezik të lartë'
  }
};

async function getGlobalCancerStats() {
  try {
    const query = `
      SELECT 
        country_name, country_code, indicator_name, indicator_code,
        CAST(year AS INT64) as year,
        CAST(value AS FLOAT64) as value
      FROM \`bigquery-public-data.world_bank_health_population.health_nutrition_population\`
      WHERE indicator_code IN ('SH.DYN.NCOM.ZS','SP.DYN.CDRT.IN')
        AND year >= 2015 AND value IS NOT NULL
      ORDER BY year DESC, country_name ASC
      LIMIT 500
    `;
    const [rows] = await bigquery.query({ query });
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getCancerBurdenData(cancerType = null) {
  const cancerInfo = cancerType ? CANCER_REGISTRY[cancerType.toLowerCase()] : null;
  try {
    const query = `
      SELECT country_name, country_code, indicator_name,
        CAST(year AS INT64) as year,
        CAST(value AS FLOAT64) as value
      FROM \`bigquery-public-data.world_bank_health_population.health_nutrition_population\`
      WHERE indicator_code = 'SH.DYN.NCOM.ZS' AND year >= 2018 AND value IS NOT NULL
      ORDER BY value DESC LIMIT 50
    `;
    const [rows] = await bigquery.query({ query });
    return { success: true, data: rows, cancerInfo };
  } catch (error) {
    return { success: false, error: error.message, cancerInfo };
  }
}

function getLocalizedCancerInfo(info, lang) {
  if (!info || lang !== 'sq') return info;
  return {
    ...info,
    name: info.name_sq || info.name,
    description: info.description_sq || info.description,
    risk_factors: info.risk_factors_sq || info.risk_factors,
    prevention: info.prevention_sq || info.prevention,
    early_signs: info.early_signs_sq || info.early_signs,
    screening: info.screening_sq || info.screening,
  };
}

async function searchCancerType(searchTerm, lang = 'en') {
  const term = searchTerm.toLowerCase().trim();
  let matchedKey = null;
  let matchedCancer = null;

  for (const [key, cancer] of Object.entries(CANCER_REGISTRY)) {
    if (
      key.includes(term) || term.includes(key) ||
      cancer.name.toLowerCase().includes(term) ||
      cancer.gbd_cause.toLowerCase().includes(term) ||
      (cancer.name_sq && cancer.name_sq.toLowerCase().includes(term))
    ) {
      matchedKey = key;
      matchedCancer = cancer;
      break;
    }
  }

  if (!matchedCancer) {
    return {
      success: false,
      error: lang === 'sq'
        ? `Nuk u gjetën të dhëna për "${searchTerm}". Provoni: mushkëri, gji, kolorektal, prostatë, lëkurë, mëlçi, stomak, cervikal, leukemi ose pankreas.`
        : `No data found for "${searchTerm}". Try: lung, breast, colorectal, prostate, skin, liver, stomach, cervical, leukemia, or pancreatic.`,
      suggestions: Object.values(CANCER_REGISTRY).map(c => lang === 'sq' ? c.name_sq : c.name)
    };
  }

  const burdenData = await getCancerBurdenData(matchedKey);
  const localizedInfo = getLocalizedCancerInfo(matchedCancer, lang);

  return {
    success: true,
    cancerType: matchedKey,
    cancerInfo: localizedInfo,
    globalData: burdenData
  };
}

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

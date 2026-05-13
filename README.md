## Executive Summary of OncoClear

OncoClear is a professional-grade full-stack web application designed to democratize access to global cancer statistics.
By synthesizing data from the WHO/IARC GLOBOCAN 2022 registry and leveraging Google BigQuery for high-performance data analysis, the platform provides healthcare professionals and the public with real-time insights into cancer incidence, mortality, and prevention strategies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router for navigation, Recharts for dynamic data visualization. |
| Backend | Node.js + Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Big Data | Google BigQuery |
| Data Source | WHO/IARC GLOBOCAN 2022 + World Bank Health Population |

## Project Structure

```
oncoclear/
├── package.json                     # Root: runs both with concurrently
│
├── backend/                         # Express API
│   ├── config/
│   │   └── bigquery.js              # BigQuery client + cancer registry
│   ├── middleware/
│   │   └── auth.js                  # JWT middleware
│   ├── models/
│   │   └── User.js                  # Mongoose User schema
│   ├── routes/
│   │   ├── auth.js                  # Register / Login / Me
│   │   └── cancer.js                # Cancer search + BigQuery queries
│   ├── .env.example                 # Environment variable template
│   └── index.js                     # Express app entry point
│
└── frontend/                        # React SPA
    └── src/
        ├── context/AuthContext.js   # Auth state + API calls
        ├── hooks/useCancerData.js   # Cancer API hook
        ├── components/Navbar.js
        └── pages/
            ├── HomePage.js          # Public landing page
            ├── RegisterPage.js      # 2-step registration form
            ├── LoginPage.js
            ├── DashboardPage.js     # Charts + WHO statistics table
            ├── SearchPage.js        # Cancer search + prevention guide
            └── DataPage.js          # Live BigQuery query runner
```

---
## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud Platform account (for BigQuery)

### 1. Clone & Install

```bash
git clone <your-repo>
cd cancer-app
npm run install-all
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/cancer_awareness
JWT_SECRET=your_long_random_secret_min_32_chars
BIGQUERY_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/bigquery-service-account.json
NODE_ENV=development
```
### 3. Set Up Google BigQuery

**Step A — Create GCP Project**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the **BigQuery API**

**Step B — Create Service Account**
1. IAM & Admin → Service Accounts → Create Service Account
2. Role: **BigQuery Data Viewer** + **BigQuery Job User**
3. Create JSON key → download file

**Step C — Place credentials**
```bash
mkdir -p backend/config
cp ~/Downloads/your-key.json backend/config/bigquery-service-account.json
```



### 4. Run

```bash
# Root directory
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Cancer Data (Protected — requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cancer/overview` | Global stats (WHO + BigQuery) |
| GET | `/api/cancer/search?q=lung` | Search cancer type |
| GET | `/api/cancer/types` | List all 10 cancer types |
| GET | `/api/cancer/stats/bigquery` | Live BigQuery query |
| GET | `/api/cancer/user/history` | User's search history |

---

## Data Sources

### Primary (always available)
**WHO/IARC GLOBOCAN 2022**
- 20,001,206 new cancer cases globally
- 9,743,832 deaths
- Top 10 cancers with incidence and mortality
- Regional breakdown by continent
- Source: https://gco.iarc.fr

### BigQuery (requires GCP setup)
**bigquery-public-data.world_bank_health_population.health_nutrition_population**
- NCD (non-communicable disease) mortality rates by country
- Health and nutrition indicators 2000-2023
- 185+ countries

---

## Cancer Types Covered

| Cancer | ICD-10 | 5yr Survival |
|--------|--------|-------------|
| Lung | C33-C34 | 22% |
| Breast | C50 | 91% |
| Colorectal | C18-C20 | 65% |
| Prostate | C61 | 98% |
| Skin/Melanoma | C43-C44 | 94% (localized) |
| Liver | C22 | 21% |
| Stomach | C16 | 36% |
| Cervical | C53 | 67% |
| Leukemia | C91-C95 | 65% |
| Pancreatic | C25 | 12% |

Each profile includes:
- Description and ICD-10 code
- Risk factors
- Evidence-based prevention steps
- Early warning signs
- Screening recommendations
- Global case count and deaths (WHO 2022)
- 5-year survival rate

---

## Disclaimer

This application is for **educational purposes only**. Data is sourced from WHO, IARC, and Google BigQuery public datasets. It does not constitute medical advice. Always consult a qualified healthcare professional for personal health decisions.
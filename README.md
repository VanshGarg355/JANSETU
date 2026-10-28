# JANSETU (जनसेतु)
### Direct Bridge Between Citizens & Government Schemes
**Build for Bharat 2026 — Team Bit Warriors**

---

## 🌟 Overview
**JanSetu** is a bilingual (Hindi + English) AI-powered civic platform designed to democratize access to welfare schemes and resolve Direct Benefit Transfer (DBT) payment failures across India.

### 🎨 Design Theme
Engineered with a **monochromatic warm taupe aesthetic**:
- **Primary Color:** `#D3C3B9`
- **Tonal Palette:** `#BDAFA6`, `#A89C94`, `#938881`, `#7E756F`, `#69615C`, `#544E4A`, `#3F3A37`, `#2A2725`, `#151312`, `#000000`
- Layered depth, subtle borders, high contrast accessibility, and responsive typography.

---

## 🚀 Key Modules & Features

1. **DBT Failure Detective (Main Innovation):**
   - Identify → Diagnose → Resolve → Escalate workflow.
   - Interactive questionnaire covering:
     - Scholarship delays (NSP)
     - Farmer subsidies (PM-KISAN)
     - Pension interruptions (NSAP/IGNOAPS)
     - Aadhaar-Bank seeding in NPCI mapper
     - Housing construction installments (PMAY)
   - Real-time rule matching with severity rating.
   - **Downloadable PDF Diagnostic Reports** (generated with PDFKit).

2. **Verified Government Scheme Finder:**
   - 25+ thoroughly verified government schemes populated across:
     - Education (NSP, PM-USP, NMMSS, Samagra Shiksha)
     - Agriculture (PM-KISAN, KCC, PM Fasal Bima Yojana)
     - Housing (PMAY-Gramin, PMAY-Urban 2.0)
     - Healthcare (Ayushman Bharat PM-JAY, PMMVY)
     - Pension (Atal Pension Yojana, IGNOAPS)
     - Financial Assistance (PM Mudra, PM SVANidhi, Stand-Up India, PMJDY, PMUY)
     - Employment (PM Vishwakarma, PMEGP, MGNREGA)
   - Live search, category filter pills, eligibility criteria, and required documents checklist.

3. **JanSetu AI Sahayak:**
   - Bilingual conversational agent (Hindi Devanagari + English).
   - Grounded in verified schemes database (RAG).
   - Zero hallucination policy; strictly prevents asking for OTPs, PINs, or 12-digit Aadhaar.
   - Powered by Groq / OpenAI with instant offline rule-based knowledge fallback.

4. **Formal Loans & Fraud Check:**
   - Discover legitimate collateral-free government credit schemes (Mudra, SVANidhi, KCC).
   - Expose predatory loan scams (instant WhatsApp loan apps, fake approval letters).
   - Direct reporting links to National Cyber Crime Reporting Portal (`cybercrime.gov.in`).

5. **1-Click Hackathon Test Scenarios:**
   - Instant pre-filled personas for judges and demonstrators:
     1. Student with delayed scholarship (NPCI seeding issue).
     2. Farmer with missing subsidy (e-KYC pending).
     3. Elderly pensioner with stalled pension (Jeevan Pramaan expired).
     4. Citizen with conflicting bank accounts.

6. **Authentication & Profile:**
   - Email/password authentication with demographic profiling.
   - Saved schemes bookmarks with persistent local storage / Supabase.

7. **Admin Console & Audit:**
   - Scheme management, verification status monitor, and rule health metrics.

---

## 🛠️ Project Structure

```
Jansetu2/
├── package.json               # Root workspaces runner
├── start.bat                  # 1-Click launcher for Windows
├── .env.example               # Config template
├── README.md                  # Complete documentation
├── database/
│   ├── 01_init.sql            # 14 PostgreSQL tables + RLS + Indexes
│   └── 02_seed.sql            # Verified scheme seeds & sources
├── backend/                   # Node.js + Express.js API
│   ├── package.json
│   ├── src/
│   │   ├── index.js           # API Entrypoint
│   │   ├── supabaseClient.js  # Supabase client & Demo Fallback
│   │   ├── middleware/        # Auth middleware
│   │   ├── routes/            # auth, schemes, dbt, ai, loans, saved, admin
│   │   └── data/              # 25+ verified schemes, DBT rules, demo scenarios
└── frontend/                  # React + Vite + Tailwind CSS
    ├── package.json
    ├── vite.config.js         # API proxy configured to :4000
    ├── tailwind.config.cjs    # Monochromatic warm taupe palette
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── i18n.js            # English & Hindi translations
        ├── components/        # Navbar, Footer, LanguageSwitcher, Scenarios
        └── pages/             # Landing, Finder, Detail, DBT, Chat, Loans, Admin
```

---

## ⚡ How to Run JanSetu

### Option 1: 1-Click Launch (Windows)
Double-click `start.bat` inside `C:\Users\vansh\OneDrive\Desktop\Jansetu2`.
It will install dependencies and start both backend and frontend servers automatically in separate terminal windows!

---

### Option 2: Command Line (PowerShell or CMD)

#### Step 1: Open Terminal in Project Folder
```powershell
cd C:\Users\vansh\OneDrive\Desktop\Jansetu2
```

#### Step 2: Start Backend (Port 4000)
Open first terminal:
```powershell
cd backend
npm install
npm run dev
```
> Backend runs at: **http://localhost:4000**

#### Step 3: Start Frontend (Port 5173)
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
> Frontend runs at: **http://localhost:5173**

---

## ⚙️ Environment Variables (Optional)
JanSetu is engineered with **Automatic Demo Mode** out of the box — it runs completely offline with verified schemes and simulated AI even if no API keys are provided!

To connect live production services, copy `.env.example` to `.env`:
```dotenv
PORT=4000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🧪 Complete Verification Journey for Demo
1. Open `http://localhost:5173`
2. **Language Toggle:** Click **हिन्दी** / **English** in the top bar.
3. **Login:** Use demo account `citizen@jansetu.in` (pre-filled).
4. **Scheme Discovery:** Go to **Scheme Finder**, search for "Kisan" or filter by "Education", bookmark a scheme.
5. **DBT Detective:** Click **DBT Detective**, choose any of the 4 test scenarios (e.g. *Student with Delayed NSP Scholarship*), proceed through questions, view diagnosis, and click **Download Official PDF**.
6. **JanSetu AI Sahayak:** Open **AI Sahayak** and ask in Hindi or English (e.g., *"आधार बैंक से कैसे लिंक करें?"*).
7. **Loans & Fraud Check:** Open **Loans & Caution** to view government loans vs fraud warnings.
"# JANSETU" 

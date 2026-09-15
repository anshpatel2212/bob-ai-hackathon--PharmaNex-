# 🚀 PharmaGuard AI

> AI-assisted pharmaceutical safety and regulatory readiness intelligence platform.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | PharmaNex |
| **Track** | AI |
| **Team Lead** | Devansh Patel — 25ce073@charusat.edu.in |
| **Members** | Ansh Patel, Prince Patel, Saiyam Purabiya |

---

## 🎯 Problem Statement

Pharmaceutical pharmacovigilance and regulatory affairs teams must review large volumes of adverse-event data and Common Technical Document (CTD) dossiers to identify potential safety signals and missing or incomplete submission documentation. Manual analysis is time-consuming, difficult to scale, and can make safety and regulatory-readiness reviews less consistent.

---

## 💡 Solution

PharmaGuard AI is an enterprise web application that combines statistical drug-safety signal detection with CTD dossier gap validation in a single platform. It uses ROR and PRR analysis for adverse-event data, evidence-based CTD section detection and gap classification, and automated clinical evaluation reporting to help teams prioritize potential safety and submission-readiness issues.

---

## ✨ Key Features

- **Safety Signal Detection:** Statistical adverse-event analysis using Reporting Odds Ratio (ROR) and Proportional Reporting Ratio (PRR).
- **Risk Classification:** Helps classify detected safety signals by risk level and prioritize issues for review.
- **CTD Gap Detection:** Validates uploaded ICH M4 Common Technical Document content against expected CTD sections and identifies missing, partial, or review-required content.
- **Regulatory Readiness:** Generates a dynamic submission-readiness assessment based on detected documentation gaps.
- **Clinical Evaluation Reporting:** Provides automated analysis and reporting to support clinical safety and regulatory review.
- **Evidence-Based Results:** Provides supporting document/page evidence where available instead of relying only on filenames or section titles.
- **Enterprise Authentication:** Secure user registration, login, JWT-based authentication, password hashing, and user-level data isolation.
- **Interactive Dashboard:** Presents safety intelligence, regulatory readiness, critical issues, and recent activity through a clean Liquid Glass interface.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, TypeScript, JavaScript, HTML, CSS |
| **Frameworks** | FastAPI, React, Vite |
| **IBM Technologies** | IBM Bob |
| **Databases** | PostgreSQL |
| **Other** | Docker, Nginx, GitHub, Render |

---

## 📁 Repository Structure

```text
bob-ai-hackathon--PharmaNex-/
├── .dockerignore
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── Dockerfile
├── Dockerfile.dev
├── README.md
├── docker-compose.yml
├── index.html
├── nginx.conf
├── package-lock.json
├── package.json
├── render.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
│
├── public/
│   ├── _redirects
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   │
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── AuthLayout.tsx
│   │   ├── Button.tsx
│   │   ├── DataTable.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FileUpload.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Header.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── data/
│   │   └── demoData.ts
│   │
│   ├── hooks/
│   │   ├── useAdverseEvents.ts
│   │   ├── useAuth.ts
│   │   ├── useDocuments.ts
│   │   └── useSignals.ts
│   │
│   ├── pages/
│   │   ├── AdverseEvents.tsx
│   │   ├── CTDDocuments.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DemoAnalysis.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── GapDetection.tsx
│   │   ├── Login.tsx
│   │   ├── PatientDetail.tsx
│   │   ├── Register.tsx
│   │   ├── Reports.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── Settings.tsx
│   │   └── SignalAnalysis.tsx
│   │
│   ├── services/
│   │   ├── adverseEvents.ts
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── documents.ts
│   │   ├── reports.ts
│   │   └── signalAnalysis.ts
│   │
│   ├── types/
│   │   ├── adverseEvent.ts
│   │   ├── auth.ts
│   │   ├── document.ts
│   │   ├── report.ts
│   │   └── signal.ts
│   │
│   └── utils/
│       └── parsers.ts
│
└── backend/
    ├── Dockerfile
    ├── alembic.ini
    ├── auth.py
    ├── database.py
    ├── dependencies.py
    ├── main.py
    ├── models.py
    ├── requirements.txt
    ├── schemas.py
    │
    ├── alembic/
    │   ├── env.py
    │   ├── script.py.mako
    │   └── versions/
    │       └── 001_initial_schema.py
    │
    ├── migrations/
    │   └── runner.py
    │
    ├── routes/
    │   ├── adverse_events.py
    │   ├── auth.py
    │   ├── documents.py
    │   ├── reports.py
    │   ├── signals.py
    │   └── users.py
    │
    ├── services/
    │   └── storage.py
    │
    └── tests/
        ├── test_auth_and_ownership.py
        └── test_auth_flow.py
```

### 📂 Directory Overview

| Directory / File | Purpose |
|---|---|
| `src/` | React + TypeScript frontend application |
| `src/components/` | Reusable UI components |
| `src/pages/` | Application pages and screens |
| `src/services/` | Frontend API and service modules |
| `src/hooks/` | Custom React hooks |
| `src/context/` | Global application state |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Frontend utility functions |
| `src/data/` | Demo/sample application data |
| `src/assets/` | Frontend images and assets |
| `public/` | Static public assets |
| `backend/` | FastAPI backend application |
| `backend/routes/` | Backend REST API routes |
| `backend/services/` | Backend service logic |
| `backend/alembic/` | Alembic database migrations |
| `backend/migrations/` | Migration runner utilities |
| `backend/tests/` | Backend tests |
| `Dockerfile` | Production Docker configuration |
| `Dockerfile.dev` | Development Docker configuration |
| `docker-compose.yml` | Local Docker Compose configuration |
| `nginx.conf` | Nginx configuration |
| `render.yaml` | Render deployment configuration |
| `.env.example` | Example environment variables |
| `package.json` | Frontend dependencies and scripts |
| `vite.config.ts` | Vite configuration |
| `tsconfig*.json` | TypeScript configuration |

---

## ⚡ How to Run

> For the complete setup instructions, see [`docs/setup-guide.md`](docs/setup-guide.md).

### Prerequisites

- Node.js v20+ recommended
- Python v3.11+ recommended
- pip or uv
- PostgreSQL for local backend development

### 1. Clone the Repository

```bash
git clone https://github.com/anshpatel2212/bob-ai-hackathon--PharmaNex-.git
cd bob-ai-hackathon--PharmaNex-
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment

Create a `.env` file and configure the backend URL:

```env
VITE_API_URL=https://bob-ai-hackathon-pharmanex-1.onrender.com
```

> Do **not** append `/api` to `VITE_API_URL`. The frontend API service automatically adds `/api`.

For local development, use:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Install Backend Dependencies — Windows PowerShell

If `pip` is not available directly, use the Python launcher:

```powershell
py --version
py -m ensurepip --upgrade
py -m pip install --upgrade pip
py -m pip install -r backend/requirements.txt
```

### 5. Start the Backend Locally

```powershell
py -m uvicorn backend.main:app --reload --reload-dir backend --host 127.0.0.1 --port 8000
```

Alternatively, if using the backend virtual environment:

```powershell
.\backend\.venv\Scripts\Activate.ps1
```

Then:

```powershell
python -m uvicorn backend.main:app --reload --reload-dir backend --host 127.0.0.1 --port 8000
```

### 6. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## ☁️ Render Deployment

PharmaGuard AI is deployed using a separated frontend/backend architecture:

```text
User Browser
     │
     ▼
React Frontend
(Render)
     │
     │ HTTPS API Requests
     ▼
FastAPI Backend
(Render Web Service)
     │
     ▼
PostgreSQL
(Render Managed Database)
```

### Backend

Current backend deployment:

```text
https://bob-ai-hackathon-pharmanex-1.onrender.com
```

Health endpoint:

```text
/health
```

FastAPI documentation:

```text
/docs
```

### Frontend

Current live application:

```text
https://bob-ai-hackathon-pharmanex.onrender.com
```

### Required Backend Environment Variables

```env
DATABASE_URL=<Render PostgreSQL Internal Database URL>
JWT_SECRET=<secure secret>
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
COOKIE_SECURE=true
COOKIE_SAMESITE=none
FRONTEND_URL=https://bob-ai-hackathon-pharmanex.onrender.com
```

### Required Frontend Environment Variable

```env
VITE_API_URL=https://bob-ai-hackathon-pharmanex-1.onrender.com
```

> The frontend and backend are deployed as separate Render services. The frontend must call the backend using its public HTTPS URL; do not configure the frontend Nginx container to proxy to `localhost` or a nonexistent `backend` hostname.

---

## 🧪 Post-Deployment Verification Checklist

- [ ] **Health Check:** Open `/health` on the backend and verify the service returns an OK response.
- [ ] **Account Registration:** Visit `/register` and create a new account.
- [ ] **Database Persistence:** Verify the user is stored in PostgreSQL with a hashed password.
- [ ] **Session & Login:** Log in and verify access to `/dashboard`.
- [ ] **Direct Navigation:** Refresh `/dashboard`, `/signal-analysis`, and other application routes to confirm SPA routing works.
- [ ] **API Connectivity:** Verify frontend requests reach the FastAPI backend without 405/HTML proxy errors.
- [ ] **User Data Isolation:** Verify adverse-event and other user-owned records remain associated with the authenticated user.
- [ ] **Gap Detection:** Upload CTD documents and run the gap analysis workflow.
- [ ] **Safety Analysis:** Run safety analysis with valid adverse-event data and verify calculated results are displayed.

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 **Demo Video** | [See `demo/demo-video-link.txt`](demo/demo-video-link.txt) |
| 🌐 **Live Demo** | [See `demo/live-demo-url.txt`](demo/live-demo-url.txt) |
| 🖼️ **Screenshots** | [See `demo/screenshots/`](demo/screenshots/) |
| 📊 **Presentation** | [See `presentation/`](presentation/) |

### Live Demo

**PharmaGuard AI:**  
https://bob-ai-hackathon-pharmanex.onrender.com

### Demo Video

**YouTube:** https://youtu.be/Tv5I_MYl6fI?si=H9YKOi1MUA48iZ1-

The demo video link is also stored in:

```text
demo/demo-video-link.txt
```

---

## 🔐 Authentication & Security

PharmaGuard AI includes enterprise-oriented authentication and data-isolation controls:

- Passwords are never stored in plaintext.
- Passwords are protected using secure password hashing.
- JWT authentication is used for authenticated API access.
- JWT payloads are kept minimal and non-sensitive.
- Authentication supports secure cookie-based sessions with Bearer-token fallback.
- User-owned records are associated with the authenticated user ID.
- Backend queries enforce user-level data isolation.
- CORS is configured for the authorized frontend origin.
- Sensitive authentication information is not intentionally exposed in application logs.

---

## 📊 Core Workflow

### Safety Signal Detection

```text
Adverse Event Data
       ↓
Data Validation & Normalization
       ↓
ROR / PRR Statistical Analysis
       ↓
Signal Evaluation
       ↓
Risk Classification
       ↓
Safety Intelligence Report
```

### Regulatory Gap Detection

```text
CTD Documents
       ↓
Document Extraction
       ↓
CTD Section Detection
       ↓
Requirement Mapping
       ↓
Present / Partial / Missing / Review Required
       ↓
Evidence & Gap Classification
       ↓
Regulatory Readiness Assessment
```

---

## ⚠️ Known Limitations

> PharmaGuard AI is an AI-assisted hackathon prototype and should not replace qualified pharmacovigilance, medical, clinical, or regulatory review.

- CTD applicability can vary by region, submission type, product, and regulatory pathway.
- Some detected gaps may require human validation before regulatory use.
- Statistical safety-signal results depend on the quality, completeness, and volume of the supplied adverse-event data.
- Small datasets may not provide sufficient evidence for a meaningful safety signal.
- The current prototype may not cover every region-specific regulatory requirement.
- Document extraction quality can depend on PDF/DOCX structure and OCR quality.
- The platform is a hackathon prototype and has not been presented as a certified regulatory-compliance system.

---

## 🏅 What We're Most Proud Of

We are most proud of combining **pharmacovigilance safety intelligence** and **regulatory submission-readiness analysis** into one focused platform.

The strongest part of PharmaGuard AI is the evidence-based **CTD Gap Detection workflow**. Instead of simply checking filenames or hardcoded results, the workflow is designed to analyze uploaded documents, identify relevant CTD sections, classify missing or incomplete requirements, provide supporting evidence, prioritize critical issues, and calculate readiness dynamically.

This gives pharmacovigilance and regulatory teams a practical starting point for identifying issues that deserve human review before submission.

---

## 🚀 Project Vision

PharmaGuard AI aims to make pharmaceutical safety and regulatory workflows more efficient by bringing data-driven safety analysis, document intelligence, and submission-readiness insights into a single workspace.

The long-term vision is to help pharmaceutical teams move from time-consuming manual review toward **evidence-based, explainable, and human-supervised regulatory intelligence**.

---

## 📄 Additional Documentation

- [`Problem Statement`](docs/problem-statement.md)
- [`Solution Overview`](docs/solution-overview.md)
- [`Architecture`](docs/architecture.md)
- [`Setup Guide`](docs/setup-guide.md)
- [`Submission Metadata`](submission.yml)

---

## 📌 Disclaimer

PharmaGuard AI is developed as a hackathon project for demonstration and evaluation purposes. Its outputs are AI-assisted decision-support information and should be reviewed and validated by appropriately qualified professionals before being used for clinical, pharmacovigilance, or regulatory decisions.

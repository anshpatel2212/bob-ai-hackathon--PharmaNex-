# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] Python 3.11+
- [ ] Node.js 20+
- [ ] npm
- [ ] PostgreSQL 15+ for local development, or access to a PostgreSQL instance
- [ ] Git
- [ ] Docker Desktop (optional; useful for containerized development)

## Environment Variables

### Backend

Create a backend `.env` file based on the project's environment configuration.

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
JWT_SECRET=<strong-random-production-secret>
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
```

Do not commit real secrets to Git.

### Frontend

For local development, configure:

```env
VITE_API_URL=http://localhost:8000
```

For the deployed frontend, the API URL should point to the deployed FastAPI service:

```env
VITE_API_URL=https://bob-ai-hackathon-pharmanex-1.onrender.com
```

The exact environment-variable names used by the existing application should be preserved if they differ.

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/anshpatel2212/bob-ai-hackathon--PharmaNex-.git
cd bob-ai-hackathon--PharmaNex-

# 2. Install backend dependencies
python -m pip install -r backend/requirements.txt

# 3. Install frontend dependencies
npm install
```

If `python` is not available on Windows, use:

```powershell
py -m pip install -r backend/requirements.txt
```

## Database Setup

Create a PostgreSQL database and set its connection string in `DATABASE_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pharmaguard_db
```

Use the project's migration mechanism if migrations are present. Do not rely on recreating production tables on every application startup.

## Running the Application

### Start the backend

From the repository root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

`http://localhost:8000`

API documentation:

`http://localhost:8000/docs`

Health check:

`http://localhost:8000/health`

### Start the frontend

In a separate terminal:

```bash
npm run dev
```

Frontend:

`http://localhost:5173`

## Production Deployment

The project is designed for separate frontend and backend deployment.

### Frontend

The production frontend is built with Vite and served using Nginx.

```bash
npm install
npm run build
```

The Docker-based frontend uses the repository's Dockerfile and Nginx configuration.

### Backend

Render backend configuration:

```text
Build Command:
pip install -r backend/requirements.txt

Start Command:
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

The backend service URL used by the deployed frontend is:

`https://bob-ai-hackathon-pharmanex-1.onrender.com`

### Live Demo

The deployed frontend is:

`https://bob-ai-hackathon-pharmanex.onrender.com`

## Running Tests

Run the project's available tests with the configured test runner.

For a basic frontend production check:

```bash
npm run build
```

For backend validation, at minimum verify:

```text
GET /health
GET /docs
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Also test the document upload and Gap Detection workflow with representative PDF/DOCX/TXT files.

## Quick Demo

1. Open the application.
2. Register or sign in.
3. Open the document/CTD workflow.
4. Upload CTD documents.
5. Run Gap Analysis.
6. Review detected CTD sections and evidence.
7. Review missing, partial, and review-required sections.
8. Review the dynamically calculated regulatory readiness score.
9. Open Safety Analysis to review adverse-event analysis.
10. Use the dashboard to review safety and regulatory readiness.

Demo data, where enabled, is clearly labeled:

`DEMO DATA`

`Fictional Patient — for demonstration only`

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` | Run `python -m pip install -r backend/requirements.txt` from the repository root. |
| `pip` is not recognized on Windows | Use `py -m pip ...` instead of `pip ...`. |
| Database connection error | Verify PostgreSQL is running and `DATABASE_URL` is correct. |
| Frontend calls the wrong API | Verify `VITE_API_URL` points to the FastAPI backend, not the frontend URL. |
| Login/Register returns `405` or HTML | Check `VITE_API_URL`, rebuild the Vite frontend, and verify the backend `/api/auth/*` routes. |
| CORS error | Verify backend `FRONTEND_URL` exactly matches the frontend origin and that credentials are configured correctly. |
| Backend root returns `Not Found` | Verify the deployed service is running the expected `backend.main:app`; `/health` and `/docs` should also be available. |
| PDF/DOCX extraction fails | Check the file format and ensure the required document-processing dependencies are installed. |
| Gap analysis returns no results | Verify documents contain readable text and that the authenticated user owns the uploaded documents. |
| Gap results look stale | Run Gap Analysis again after adding/removing documents so the analysis reflects the current document set. |
| Frontend production build fails | Run `npm install` and `npm run build` locally and fix TypeScript/build errors before deploying. |

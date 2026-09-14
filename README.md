# PharmaGuard AI

> AI-assisted pharmaceutical safety and regulatory readiness intelligence platform.

PharmaGuard AI is an enterprise web application designed for pharmacovigilance and regulatory affairs professionals. It provides statistical safety signal detection (ROR & PRR), ICH M4 Common Technical Document (CTD) dossier gap validation, and automated clinical evaluation reporting.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+ recommended)
- Python (v3.11+ recommended)
- uv or pip

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev
```

### 2. Backend Setup

#### Windows PowerShell Setup (Recommended)
On Windows, running `pip` directly may return `"pip : The term 'pip' is not recognized..."` if Python's `Scripts\` folder is not on your system PATH. Using the standard Windows Python launcher `py` solves this completely:

1. **Check Python version:**
   ```powershell
   py --version
   ```
   *(If `py` is not recognized, install or repair Python from [python.org](https://www.python.org/downloads/) and ensure "Add python.exe to PATH" and "py launcher" are checked).*

2. **Restore pip if missing:**
   ```powershell
   py -m ensurepip --upgrade
   ```

3. **Upgrade pip:**
   ```powershell
   py -m pip install --upgrade pip
   ```

4. **Install backend dependencies:**
   ```powershell
   py -m pip install -r backend/requirements.txt
   ```

5. **Start backend locally:**
   ```powershell
   py -m uvicorn backend.main:app --reload --reload-dir backend --host 127.0.0.1 --port 8000
   ```

*(Optional: If using the virtual environment in `backend/.venv`, activate it with `.\backend\.venv\Scripts\Activate.ps1` or run `.\backend\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --reload-dir backend --host 127.0.0.1 --port 8000`).*

---

## ☁️ Deploy on Render

PharmaGuard AI is pre-configured for automated deployment on [Render](https://render.com) using **Render Blueprints** or manual service configuration.

```text
User Browser
     │
     ▼
React Frontend  (Render Static Site)
     │
     │ HTTPS Requests (with HttpOnly cookies & Bearer fallback)
     ▼
FastAPI Backend (Render Web Service on $PORT)
     │
     ▼
PostgreSQL      (Render Managed Database)
```

---

### Option A: One-Click Blueprint Deployment (Recommended)

1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect your GitHub repository containing `render.yaml`.
4. Render will automatically provision:
   - **PostgreSQL Database** (`pharmaguard-db`)
   - **FastAPI Web Service** (`pharmaguard-backend`)
   - **React Static Site** (`pharmaguard-frontend`)
5. Once the services are created:
   - Copy the backend URL (e.g., `https://pharmaguard-backend.onrender.com`).
   - In the frontend settings, set `VITE_API_URL` to your backend URL (e.g. `https://pharmaguard-backend.onrender.com` — **do NOT append `/api`**).
   - In the backend settings, verify `FRONTEND_URL` is set to `https://bob-ai-hackathon-pharmanex.onrender.com`.

---

### Option B: Manual Service Setup

#### Step 1: Create the PostgreSQL Database
1. Go to **New +** → **PostgreSQL**.
2. Name: `pharmaguard-db`
3. Database: `pharmaguard_db`
4. User: `pharmaguard`
5. Click **Create Database** and copy the **Internal Database URL**.

#### Step 2: Deploy the Backend (Web Service)
1. Go to **New +** → **Web Service** and connect your repository.
2. Name: `pharmaguard-backend`
3. Environment: `Python`
4. Root Directory: `/`
5. Build Command:
   ```bash
   pip install -r backend/requirements.txt
   ```
6. Start Command:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
7. Health Check Path: `/health`
8. Add Environment Variables:
   - `DATABASE_URL`: *(Your Render PostgreSQL Internal Database URL)*
   - `JWT_SECRET`: *(Generate a secure 64-char key using `openssl rand -hex 32`)*
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
   - `ENVIRONMENT`: `production`
   - `COOKIE_SECURE`: `true`
   - `COOKIE_SAMESITE`: `none`
   - `FRONTEND_URL`: `https://bob-ai-hackathon-pharmanex.onrender.com`
9. Click **Create Web Service**.

#### Step 3: Deploy the Frontend (Static Site)
1. Go to **New +** → **Static Site** and connect your repository.
2. Name: `pharmaguard-frontend`
3. Build Command:
   ```bash
   npm install && npm run build
   ```
4. Publish Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-subdomain>.onrender.com` *(Do NOT append `/api`; `src/services/api.ts` automatically appends `/api`)*
6. Click **Create Static Site**.
   *(SPA routing is automatically handled via `public/_redirects`)*.

---

## 🧪 Post-Deployment Verification Checklist

After deploying to Render:
- [ ] **Health Check**: Open `https://<backend-url>/health` → should return `{"status": "ok"}`.
- [ ] **Account Registration**: Visit `https://<frontend-url>/register` and register a new account.
- [ ] **Database Persistence**: Verify user is saved in Render PostgreSQL with hashed password.
- [ ] **Session & Login**: Log in with credentials and verify access to `/dashboard`.
- [ ] **Direct Navigation & Refresh**: Refresh `/dashboard` or `/signal-analysis` directly in the browser to confirm SPA rewrite does not return a 404.
- [ ] **User Data Isolation**: Test adverse event creation and verify data is strictly bound to the authenticated user ID.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server with HMR |
| `npm run build` | Compiles TypeScript (`tsc -b`) and generates production bundle (`vite build`) |
| `npm run lint` | Runs `oxlint` fast linter validation |
| `npm run preview` | Previews the production bundle locally |

---

## 🛡 Privacy & Security Note

PharmaGuard AI is designed for enterprise pharmaceutical regulatory environments. Passwords are never stored in plaintext, JWT tokens use modern HMAC-SHA256 signatures with minimal non-sensitive payloads, and all user records are strictly isolated at the database query level.

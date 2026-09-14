# PharmaGuard AI

> AI-assisted pharmaceutical safety and regulatory readiness intelligence platform.

PharmaGuard AI is an enterprise web application designed for pharmacovigilance and regulatory affairs professionals. It provides statistical safety signal detection (ROR & PRR), ICH M4 Common Technical Document (CTD) dossier gap validation, and automated clinical evaluation reporting.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🐳 Running with Docker

PharmaGuard AI is fully containerized with a production-optimized multi-stage build using **Node 20 Alpine** (builder) and **Nginx 1.27 Alpine** (runtime server).

### Option 1: Using Docker Compose (Recommended)

To build and start the production container in the background:
```bash
docker compose up -d --build
```
Access the application at **`http://localhost:8080`**.

To stop the container:
```bash
docker compose down
```

#### Development Mode with Hot Reloading via Docker Compose:
```bash
docker compose --profile dev up --build
```
Access the development environment at **`http://localhost:5173`**.

---

### Option 2: Using the Docker CLI Directly

#### 1. Build the Docker image:
```bash
docker build -t pharmaguard-ai:latest .
```

#### 2. Run the container:
```bash
docker run -d \
  --name pharmaguard-ai \
  -p 8080:80 \
  --restart unless-stopped \
  pharmaguard-ai:latest
```

#### 3. Verify container health:
```bash
docker ps
curl http://localhost:8080/health
```

---

## 🏗 Container Architecture & Features

- **Multi-Stage Build**: Keeps the production image under 30MB by cleanly separating the Node build tools from the lightweight Nginx runtime.
- **Single Page Application (SPA) Routing**: Nginx is pre-configured with fallback rules (`try_files $uri $uri/ /index.html;`) to support React Router deep links and direct browser refreshes.
- **Security Headers**: Includes `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
- **Gzip Compression**: Compresses text, JavaScript, CSS, JSON, and SVG payloads.
- **Asset Caching**: Hashed static assets (`/assets/*`) are cached for 1 year (`immutable`), while `index.html` is never cached to ensure instant updates.
- **Health Check Endpoint**: Built-in `/health` route for load balancers and container orchestrators.

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server with HMR |
| `npm run build` | Compiles TypeScript (`tsc -b`) and generates production bundle (`vite build`) |
| `npm run lint` | Fast linter validation using `oxlint` |
| `npm run preview` | Previews the production build locally |

---

## 🛡 Privacy & Compliance Note

PharmaGuard AI operates client-side with isolated local storage and simulated cryptographic authentication. It is designed to respect organizational privacy and regulatory data isolation guidelines.

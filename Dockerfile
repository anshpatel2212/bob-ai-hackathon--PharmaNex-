# ============================================================
# Stage 1 — React/Vite Build
# ============================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Pass build-time environment variable for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build React/Vite application
RUN npm run build


# ============================================================
# Stage 2 — Nginx Production Server
# ============================================================

FROM nginx:1.27-alpine

# Remove default Nginx configuration and files
RUN rm -rf /etc/nginx/conf.d/default.conf \
    /usr/share/nginx/html/*

# Copy our Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Render exposes the container on port 80
EXPOSE 80

# Container health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
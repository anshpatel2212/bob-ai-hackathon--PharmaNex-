# ==============================================================================
# Stage 1: Build Phase
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies utilizing Docker cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source and configuration files
COPY . .

# Build the production bundle
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime Phase
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx website configuration
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom Nginx configuration optimized for React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to monitor container readiness
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]

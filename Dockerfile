# Dockerfile
# --- Build stage ---
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies (this creates Linux-compatible node_modules)
RUN npm ci

# Copy source code (excluding node_modules)
COPY . .

# Build the application
RUN npm run build

# --- Serve stage (Caddy) ---
FROM caddy:2-alpine

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy built application from build stage
# Angular 16+ default output path is dist/task-tracker/browser
COPY --from=build /app/dist/task-tracker/browser /usr/share/caddy

# Expose port 80
EXPOSE 80

# Caddy will start automatically using the Caddyfile
# Multi-stage build for optimized Docker image
# Stage 1: Builder - compile TypeScript to JavaScript
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 2: Production - minimal runtime image
FROM node:18-alpine AS production

# Set environment to production
ENV NODE_ENV=production

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Copy built JavaScript from builder
COPY --from=builder /app/dist ./dist

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy environment config (optional, can be overridden)
# COPY .env .env

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Run the HTTP server
CMD ["node", "dist/server-http.js"]

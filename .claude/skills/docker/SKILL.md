# Docker Expert Skill

You are now equipped with comprehensive knowledge of **Docker containerization best practices**, Dockerfile optimization, Docker Compose orchestration, security hardening, multi-stage builds, networking, and production deployment strategies.

Use this expertise when working with containerized applications, optimizing Docker images, managing container orchestration, ensuring security, and deploying production-ready containers.

---

## 📋 Table of Contents

1. [Docker Fundamentals](#docker-fundamentals)
2. [Dockerfile Best Practices](#dockerfile-best-practices)
3. [Multi-Stage Builds](#multi-stage-builds)
4. [Layer Caching & Build Optimization](#layer-caching--build-optimization)
5. [Docker Compose](#docker-compose)
6. [Container Security (2025)](#container-security-2025)
7. [Networking](#networking)
8. [Volumes & Data Management](#volumes--data-management)
9. [Health Checks & Monitoring](#health-checks--monitoring)
10. [Production Deployment](#production-deployment)
11. [Docker CLI & Commands](#docker-cli--commands)
12. [Troubleshooting & Debugging](#troubleshooting--debugging)
13. [Common Patterns & Anti-Patterns](#common-patterns--anti-patterns)

---

## Docker Fundamentals

### Core Concepts

**Images vs Containers:**
- **Image**: Read-only template with application code, dependencies, and configuration
- **Container**: Running instance of an image with its own filesystem, networking, and processes
- **Registry**: Storage for Docker images (Docker Hub, GitHub Container Registry, private registries)

```bash
# Image hierarchy
docker images          # List all images
docker pull nginx:alpine    # Pull image from registry
docker build -t myapp:1.0 . # Build image from Dockerfile
docker push myorg/myapp:1.0 # Push to registry
```

### Container Lifecycle

```
┌──────────┐
│  Image   │
└────┬─────┘
     │ docker run
     ▼
┌──────────┐    docker start    ┌──────────┐
│ Created  │──────────────────> │ Running  │
└──────────┘                    └────┬─────┘
                                     │
                     ┌───────────────┼────────────────┐
                     │               │                │
              docker stop      docker pause    docker kill
                     │               │                │
                     ▼               ▼                ▼
               ┌──────────┐    ┌──────────┐    ┌──────────┐
               │ Stopped  │    │  Paused  │    │  Dead    │
               └──────────┘    └──────────┘    └──────────┘
```

### Image Layers

```
┌─────────────────────────────┐
│  Application Code Layer     │ ← Your code (changes frequently)
├─────────────────────────────┤
│  Dependencies Layer         │ ← npm install, pip install
├─────────────────────────────┤
│  Runtime Layer              │ ← Node.js, Python, etc.
├─────────────────────────────┤
│  Base OS Layer (Alpine)     │ ← Minimal Linux
└─────────────────────────────┘
```

**Key Principle:** Each Dockerfile instruction creates a new layer. Layers are cached and reused.

### Docker Architecture

```
┌──────────────────────────────────────────┐
│           Docker Client (CLI)            │
│        docker build, run, push           │
└──────────────┬───────────────────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────────────────┐
│          Docker Daemon (dockerd)         │
│  ┌────────────────────────────────────┐  │
│  │   Container Runtime (containerd)   │  │
│  │  ┌──────────┐    ┌──────────┐     │  │
│  │  │Container1│    │Container2│     │  │
│  │  └──────────┘    └──────────┘     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Host Operating System            │
└──────────────────────────────────────────┘
```

---

## Dockerfile Best Practices

### Optimal Dockerfile Structure

```dockerfile
# ✅ Good: Optimized Dockerfile for Node.js
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/server.js"]
```

### Instruction Order Optimization

```dockerfile
# ❌ Bad: Invalidates cache on every code change
FROM node:20-alpine
WORKDIR /app
COPY . .                    # Copies everything first
RUN npm install            # Cache invalidated every time
CMD ["node", "server.js"]

# ✅ Good: Maximizes cache usage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./      # Copy only package files first
RUN npm ci                 # Cache preserved if package.json unchanged
COPY . .                   # Copy code last
CMD ["node", "server.js"]
```

### Minimal Base Images (2025)

```dockerfile
# Image size comparison:
# node:20           ~ 1.1GB
# node:20-slim      ~ 240MB
# node:20-alpine    ~ 130MB
# distroless        ~ 120MB

# ✅ Best: Alpine for smaller size
FROM node:20-alpine

# ✅ Best: Distroless for maximum security (Google)
FROM gcr.io/distroless/nodejs20-debian12

# ✅ Best: Chainguard Images (minimal CVEs)
FROM cgr.dev/chainguard/node:latest
```

### .dockerignore Best Practices

```dockerignore
# .dockerignore - Exclude from build context

# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Build outputs
dist
build
.next
.nuxt

# Development
.git
.github
.vscode
.idea
*.md
LICENSE

# Environment files
.env
.env.*
!.env.example

# Tests
__tests__
*.test.js
*.spec.js
coverage

# Logs
logs
*.log

# OS files
.DS_Store
Thumbs.db
```

### ARG vs ENV

```dockerfile
# ARG: Build-time variables (not available in running container)
ARG NODE_VERSION=20
ARG BUILD_DATE

FROM node:${NODE_VERSION}-alpine

# ENV: Runtime variables (available in running container)
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Use ARG in build, persist with ENV
ARG APP_VERSION=1.0.0
ENV APP_VERSION=${APP_VERSION}

# Usage
RUN echo "Building version ${APP_VERSION} on ${BUILD_DATE}"
```

---

## Multi-Stage Builds

### Basic Multi-Stage Pattern

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
USER node
CMD ["node", "dist/server.js"]
```

### Advanced Multi-Stage with Caching

```dockerfile
# Syntax version (enables BuildKit features)
# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Development dependencies
FROM base AS dev-deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Builder stage
FROM base AS builder
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && \
    npm prune --production

# Test stage (optional, can run separately)
FROM base AS test
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run test

# Production stage
FROM base AS production
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./

USER nodejs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
```

### Build Specific Stages

```bash
# Build all stages (default: last stage)
docker build -t myapp:latest .

# Build specific stage
docker build --target test -t myapp:test .
docker build --target production -t myapp:prod .

# Build with cache mounts (requires BuildKit)
DOCKER_BUILDKIT=1 docker build -t myapp:latest .

# Multi-platform build
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest .
```

### Size Comparison

```
Single-stage build:   1.2 GB
Multi-stage build:    180 MB  (85% reduction)
Multi-stage + Alpine: 130 MB  (89% reduction)
Distroless:          120 MB  (90% reduction)
```

---

## Layer Caching & Build Optimization

### Cache Mount Pattern (BuildKit)

```dockerfile
# syntax=docker/dockerfile:1.4

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# ✅ Best: Use cache mount to persist npm cache
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.npm \
    npm ci --cache /app/.npm --prefer-offline

# ✅ Alternative: Bind mount for package.json
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build
```

### Combining RUN Instructions

```dockerfile
# ❌ Bad: Multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean

# ✅ Good: Single layer with cleanup
RUN apt-get update && \
    apt-get install -y \
        curl \
        git \
        --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ Best: Use heredoc syntax (Docker 1.4+)
RUN <<EOF
apt-get update
apt-get install -y curl git --no-install-recommends
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF
```

### Build Arguments for Optimization

```dockerfile
# Use build args to control caching
ARG BUILDKIT_INLINE_CACHE=1

FROM node:20-alpine AS base

# Skip optional dependencies
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN if [ "$NODE_ENV" = "production" ]; then \
        npm ci --only=production; \
    else \
        npm ci; \
    fi
```

### Build Performance Tips

```bash
# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1

# Use cache-from for CI/CD
docker build \
    --cache-from myapp:latest \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    -t myapp:new .

# Prune build cache periodically
docker builder prune -af

# Check build cache usage
docker system df -v
```

---

## Docker Compose

### Modern Docker Compose (2025)

```yaml
# docker-compose.yml (no version field needed in 2025)

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        NODE_ENV: production
    image: myapp:latest
    container_name: myapp
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
```

### Multi-Environment Setup

```yaml
# docker-compose.yml (base)
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development

# docker-compose.override.yml (development - auto-loaded)
services:
  app:
    volumes:
      - ./src:/app/src
      - /app/node_modules
    command: npm run dev

# docker-compose.production.yml (production)
services:
  app:
    image: myapp:latest
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
```

```bash
# Development (uses docker-compose.yml + docker-compose.override.yml)
docker compose up

# Production
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d

# Staging
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### Compose Commands (2025)

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Execute command in running container
docker compose exec app npm run migrate

# Rebuild and restart
docker compose up -d --build

# Scale services
docker compose up -d --scale app=3

# Stop and remove
docker compose down

# Stop and remove with volumes
docker compose down -v

# View resource usage
docker compose stats
```

---

## Container Security (2025)

### Run as Non-Root User

```dockerfile
# ✅ Good: Create and use non-root user
FROM node:20-alpine

WORKDIR /app

# Create group and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy files
COPY --chown=nodejs:nodejs . .

# Install dependencies
RUN npm ci

# Switch to non-root user
USER nodejs

# Application runs as nodejs user
CMD ["node", "server.js"]
```

### Read-Only Filesystem

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    read_only: true  # Make root filesystem read-only
    tmpfs:
      - /tmp
      - /app/logs
    volumes:
      - ./data:/app/data  # Writable volume if needed
```

```bash
# CLI
docker run --read-only --tmpfs /tmp myapp:latest
```

### Security Scanning (2025 Tools)

**Trivy (Recommended):**

```bash
# Install Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan image
trivy image myapp:latest

# Scan with severity filter
trivy image --severity HIGH,CRITICAL myapp:latest

# Output as JSON
trivy image -f json -o results.json myapp:latest

# CI/CD integration
trivy image --exit-code 1 --severity CRITICAL myapp:latest
```

**Docker Scout:**

```bash
# Enable Docker Scout
docker scout enroll

# Scan image
docker scout cves myapp:latest

# Compare with base image
docker scout compare --to node:20-alpine myapp:latest

# View recommendations
docker scout recommendations myapp:latest
```

**Snyk:**

```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Scan Dockerfile
snyk container test myapp:latest

# Monitor for vulnerabilities
snyk container monitor myapp:latest
```

### Secrets Management

```dockerfile
# ❌ Bad: Secrets in Dockerfile
ENV API_KEY=sk-1234567890

# ❌ Bad: Secrets in build args
ARG API_KEY
RUN echo $API_KEY > /app/config

# ✅ Good: Use build secrets (BuildKit)
# syntax=docker/dockerfile:1.4

RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && \
    echo "API configured"
```

```bash
# Build with secret
docker build --secret id=api_key,src=./api-key.txt -t myapp .
```

```yaml
# docker-compose.yml with secrets
services:
  app:
    image: myapp:latest
    secrets:
      - api_key
      - db_password

secrets:
  api_key:
    file: ./secrets/api_key.txt
  db_password:
    environment: DB_PASSWORD
```

### Security Best Practices Checklist

```dockerfile
# ✅ Complete secure Dockerfile example

# syntax=docker/dockerfile:1.4

# Use specific version tags
FROM node:20.11.0-alpine3.19 AS base

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy with ownership
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies with cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Copy application
COPY --chown=nodejs:nodejs . .

# Remove unnecessary files
RUN rm -rf .git .github *.md

# Switch to non-root user
USER nodejs

# Use EXPOSE for documentation
EXPOSE 3000

# Set security-related env vars
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Non-root CMD
CMD ["node", "server.js"]
```

### Rootless Docker

```bash
# Install rootless Docker
curl -fsSL https://get.docker.com/rootless | sh

# Set environment
export PATH=/home/username/bin:$PATH
export DOCKER_HOST=unix:///run/user/1000/docker.sock

# Run rootless daemon
systemctl --user start docker

# Verify
docker context use rootless
docker run hello-world
```

### Security Scanning in CI/CD

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

      - name: Run Docker Scout
        run: |
          docker scout cves myapp:${{ github.sha }} \
            --exit-code \
            --only-severity critical,high
```

---

## Networking

### Network Types

```bash
# Bridge (default) - Isolated network
docker network create app-network

# Host - Use host's network stack
docker run --network host myapp

# None - No networking
docker run --network none myapp

# Custom bridge with subnet
docker network create \
    --driver bridge \
    --subnet 172.20.0.0/16 \
    --gateway 172.20.0.1 \
    custom-network
```

### Service Discovery in Compose

```yaml
services:
  api:
    image: api:latest
    networks:
      - backend

  db:
    image: postgres:16-alpine
    networks:
      - backend

  # API can access DB at: postgresql://db:5432
  # Service name becomes hostname

networks:
  backend:
    driver: bridge
```

### Network Aliases

```yaml
services:
  api:
    image: api:latest
    networks:
      backend:
        aliases:
          - api-server
          - api-gateway

  # Can access at: http://api-server or http://api-gateway
```

### Port Binding

```yaml
services:
  app:
    image: myapp:latest
    ports:
      # HOST:CONTAINER
      - "3000:3000"           # Bind to all interfaces
      - "127.0.0.1:8080:8080" # Bind to localhost only
      - "9000-9005:9000-9005" # Range
    expose:
      - "8080"  # Expose to other containers (not host)
```

### Network Isolation

```yaml
services:
  frontend:
    networks:
      - frontend-net

  api:
    networks:
      - frontend-net
      - backend-net

  db:
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:

# frontend → api ✅
# api → db ✅
# frontend → db ❌ (isolated)
```

---

## Volumes & Data Management

### Volume Types

```yaml
services:
  app:
    volumes:
      # Named volume (managed by Docker)
      - app-data:/app/data

      # Bind mount (host path)
      - ./config:/app/config

      # Anonymous volume
      - /app/logs

      # Read-only mount
      - ./static:/app/static:ro

      # tmpfs (in-memory)
    tmpfs:
      - /tmp

volumes:
  app-data:
    driver: local
```

### Development vs Production Volumes

```yaml
# Development - bind mounts for hot reload
services:
  app:
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - /app/node_modules  # Exclude node_modules

# Production - named volumes for data
services:
  app:
    volumes:
      - app-logs:/app/logs
      - app-uploads:/app/uploads
```

### Backup and Restore

```bash
# Backup volume to tar
docker run --rm \
    -v postgres-data:/data \
    -v $(pwd):/backup \
    alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore volume from tar
docker run --rm \
    -v postgres-data:/data \
    -v $(pwd):/backup \
    alpine tar xzf /backup/postgres-backup.tar.gz -C /data

# Copy data between volumes
docker run --rm \
    -v old-volume:/from \
    -v new-volume:/to \
    alpine sh -c "cd /from && cp -av . /to"
```

---

## Health Checks & Monitoring

### Dockerfile Health Checks

```dockerfile
# HTTP health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Using curl
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Using Node.js
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Database health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD pg_isready -U postgres || exit 1
```

### Compose Health Checks

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      api:
        condition: service_healthy
      db:
        condition: service_healthy
```

### Monitoring Container Health

```bash
# Check container health status
docker ps --filter "health=healthy"
docker ps --filter "health=unhealthy"

# Inspect health
docker inspect --format='{{.State.Health.Status}}' container-name

# View health check logs
docker inspect --format='{{json .State.Health}}' container-name | jq

# Auto-restart unhealthy containers
docker run --restart=on-failure:3 myapp:latest
```

---

## Production Deployment

### Production Dockerfile

```dockerfile
# syntax=docker/dockerfile:1.4

# Production-ready Node.js Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat tini
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production && \
    npm cache clean --force

# Build
FROM base AS builder
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build && \
    npm prune --production

# Production
FROM base AS production

ENV NODE_ENV=production \
    PORT=3000

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/server.js"]
```

### Production Compose

```yaml
services:
  app:
    image: myapp:${VERSION:-latest}
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        labels: "service=app"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    secrets:
      - api_key
      - db_password
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

secrets:
  api_key:
    external: true
  db_password:
    external: true
```

### Container Resource Limits

```bash
# CPU limits
docker run --cpus="1.5" myapp

# Memory limits
docker run --memory="512m" --memory-swap="1g" myapp

# Combined
docker run \
    --cpus="2.0" \
    --memory="1g" \
    --memory-reservation="512m" \
    --pids-limit=100 \
    myapp
```

---

## Docker CLI & Commands

### Essential Commands

```bash
# Images
docker images                          # List images
docker pull nginx:alpine               # Pull image
docker build -t myapp:1.0 .           # Build image
docker tag myapp:1.0 myapp:latest     # Tag image
docker push myapp:latest              # Push to registry
docker rmi myapp:1.0                  # Remove image
docker image prune -a                 # Remove unused images

# Containers
docker ps                             # List running containers
docker ps -a                          # List all containers
docker run -d -p 3000:3000 myapp      # Run container
docker stop container-id              # Stop container
docker start container-id             # Start container
docker restart container-id           # Restart container
docker rm container-id                # Remove container
docker logs -f container-id           # View logs
docker exec -it container-id sh       # Execute shell

# Networks
docker network ls                     # List networks
docker network create mynet           # Create network
docker network inspect mynet          # Inspect network
docker network rm mynet               # Remove network

# Volumes
docker volume ls                      # List volumes
docker volume create myvol            # Create volume
docker volume inspect myvol           # Inspect volume
docker volume rm myvol                # Remove volume

# System
docker system df                      # Show disk usage
docker system prune -a                # Clean everything
docker stats                          # Resource usage
docker info                           # System info
```

### Advanced Commands

```bash
# Build with BuildKit
DOCKER_BUILDKIT=1 docker build \
    --target production \
    --cache-from myapp:latest \
    --build-arg VERSION=1.0.0 \
    --secret id=api_key,src=./key.txt \
    -t myapp:1.0.0 .

# Multi-platform build
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t myapp:latest \
    --push .

# Export/Import images
docker save -o myapp.tar myapp:latest
docker load -i myapp.tar

# Copy files
docker cp container-id:/app/logs ./logs
docker cp ./config.json container-id:/app/

# Inspect
docker inspect container-id | jq
docker inspect --format='{{.NetworkSettings.IPAddress}}' container-id
```

---

## Troubleshooting & Debugging

### Container Debugging

```bash
# View logs
docker logs container-id
docker logs -f --tail 100 container-id
docker logs --since 1h container-id

# Execute commands
docker exec -it container-id sh
docker exec container-id ps aux
docker exec container-id env

# View processes
docker top container-id

# View changes to filesystem
docker diff container-id

# View stats
docker stats container-id

# Export container filesystem
docker export container-id > container.tar
```

### Network Debugging

```bash
# Inspect network
docker network inspect bridge

# Test connectivity
docker run --rm --network app-network nicolaka/netshoot ping api

# DNS resolution
docker run --rm --network app-network nicolaka/netshoot nslookup api

# Port scanning
docker run --rm --network app-network nicolaka/netshoot nc -zv api 3000
```

### Common Issues

**Issue: Container exits immediately**
```bash
# Check logs
docker logs container-id

# Run interactively
docker run -it myapp sh

# Override entrypoint
docker run -it --entrypoint sh myapp
```

**Issue: Permission denied**
```bash
# Check user
docker exec container-id whoami

# Run as root (debugging only)
docker exec -u root -it container-id sh
```

**Issue: Out of disk space**
```bash
# Check usage
docker system df

# Clean up
docker system prune -af --volumes
```

**Issue: Port already in use**
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep 3000

# Use different port
docker run -p 3001:3000 myapp
```

---

## Common Patterns & Anti-Patterns

### ✅ Best Practices

**1. Multi-Stage Builds**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

**2. Layer Caching**
```dockerfile
# Copy package files first
COPY package*.json ./
RUN npm ci
# Copy code last (changes frequently)
COPY . .
```

**3. Security Hardening**
```dockerfile
# Run as non-root
USER nodejs
# Read-only filesystem
# --read-only flag
# Scan for vulnerabilities
```

**4. Health Checks**
```dockerfile
HEALTHCHECK CMD wget -q --spider http://localhost:3000/health
```

### ❌ Anti-Patterns

**1. Using Latest Tag**
```dockerfile
# ❌ Bad
FROM node:latest

# ✅ Good
FROM node:20.11.0-alpine3.19
```

**2. Running as Root**
```dockerfile
# ❌ Bad
CMD ["node", "server.js"]

# ✅ Good
USER nodejs
CMD ["node", "server.js"]
```

**3. Hardcoded Secrets**
```dockerfile
# ❌ Bad
ENV API_KEY=sk-1234567890

# ✅ Good - use secrets
RUN --mount=type=secret,id=api_key
```

**4. Large Images**
```dockerfile
# ❌ Bad: 1.1GB
FROM node:20

# ✅ Good: 130MB
FROM node:20-alpine
```

**5. Not Using .dockerignore**
```dockerfile
# ❌ Bad: Copies everything
COPY . .

# ✅ Good: Use .dockerignore
node_modules
.git
*.log
```

---

## Quick Reference Checklist

When working with Docker, verify:

- [ ] Use specific version tags (not `latest`)
- [ ] Multi-stage builds for production
- [ ] Run as non-root user
- [ ] `.dockerignore` configured
- [ ] Layer caching optimized
- [ ] Health checks implemented
- [ ] Resource limits set
- [ ] Security scanning enabled
- [ ] Secrets managed properly
- [ ] Logs configured (max size/files)
- [ ] Restart policy defined
- [ ] Network isolation configured
- [ ] Volumes for persistent data
- [ ] Alpine or distroless base images
- [ ] BuildKit features enabled

---

## Usage Instructions

When this skill is invoked, use it to:

1. **Optimize Dockerfiles** - Apply multi-stage builds, layer caching, and minimal base images
2. **Secure containers** - Run as non-root, scan for vulnerabilities, manage secrets
3. **Configure Compose** - Set up multi-service applications with proper networking and dependencies
4. **Debug issues** - Troubleshoot container, network, and build problems
5. **Deploy to production** - Configure health checks, resource limits, and restart policies
6. **Monitor containers** - Set up logging, metrics, and health monitoring

**Remember**: Prioritize security, optimize for size and build time, and follow the principle of least privilege!

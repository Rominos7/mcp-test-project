# Build System Documentation

This document explains the build system, npm scripts, and development workflow for the MCP Server project.

## Table of Contents

- [Quick Start](#quick-start)
- [Build Scripts](#build-scripts)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Docker Builds](#docker-builds)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Development (with hot reload)
npm run dev

# Production build and run
npm run build
npm start

# Docker deployment
npm run docker:up
```

---

## Build Scripts

### Core Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Full build pipeline (clean → compile → verify) |
| `npm run build:watch` | Watch mode - rebuilds on file changes |
| `npm run build:prod` | Production build without source maps |
| `npm run clean` | Remove all build artifacts |
| `npm run verify` | Verify build output integrity |
| `npm run type-check` | Type-check without emitting files |

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start HTTP server in dev mode (default) |
| `npm run dev:http` | Start HTTP server with tsx (hot reload) |
| `npm run dev:stdio` | Start stdio server with tsx |
| `npm run dev:client` | Start client in dev mode |
| `npm run dev:watch` | Watch mode with auto-restart |

### Production Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Build and start HTTP server |
| `npm run start:http` | Start HTTP server from built files |
| `npm run start:stdio` | Start stdio server from built files |
| `npm run start:client` | Start client from built files |

### Docker Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |
| `npm run docker:up` | Start with docker-compose (detached) |
| `npm run docker:down` | Stop docker-compose services |
| `npm run docker:logs` | View docker-compose logs |
| `npm run docker:rebuild` | Rebuild and restart containers |
| `npm run docker:clean` | Remove containers and images |

---

## Development Workflow

### 1. Local Development (TypeScript)

```bash
# Start development server with hot reload
npm run dev:http

# In another terminal, make changes to TypeScript files
# The server will automatically restart on changes
```

**Files watched:**
- `*.ts` (root level: server.ts, client.ts, server-http.ts)
- `src/**/*.ts` (all TypeScript files in src/)

### 2. Testing Changes

```bash
# Type check without building
npm run type-check

# Full build to verify compilation
npm run build

# Test the built output
npm run start:http
```

### 3. Build Pipeline Steps

When you run `npm run build`, the following happens:

1. **prebuild**: Runs `npm run clean` (removes dist/)
2. **build**: Runs `tsc` (compiles TypeScript)
3. **postbuild**: Runs `npm run verify` (validates build)

```
┌─────────────┐
│   Clean     │  rm -rf dist/
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Compile    │  tsc
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Verify    │  Check all files exist
└─────────────┘
```

---

## Production Deployment

### Option 1: Node.js Deployment

```bash
# 1. Build the project
npm run build

# 2. Copy necessary files to server
#    - dist/ directory
#    - node_modules/ directory
#    - package.json
#    - .env (with production values)

# 3. On server, start the application
NODE_ENV=production npm run start:http
```

### Option 2: Docker Deployment (Recommended)

```bash
# 1. Build Docker image
npm run docker:build

# 2. Run with docker-compose
npm run docker:up

# 3. Check logs
npm run docker:logs

# 4. Stop when needed
npm run docker:down
```

### Option 3: Cloud Platform

**Railway / Render / Fly.io:**
```bash
# These platforms auto-detect package.json
# They will run: npm run build && npm start
```

**AWS / Azure / GCP:**
```bash
# Push Docker image to container registry
docker tag mcp-server:latest your-registry/mcp-server:latest
docker push your-registry/mcp-server:latest

# Deploy to container service
# (ECS, App Service, Cloud Run, etc.)
```

---

## Docker Builds

### Understanding the Dockerfile

The project uses a **multi-stage build** for optimization:

```dockerfile
# Stage 1: Builder (compile TypeScript)
FROM node:18-alpine AS builder
# ... install deps, build TypeScript

# Stage 2: Production (minimal runtime)
FROM node:18-alpine AS production
# ... copy only built files and prod deps
```

**Benefits:**
- Final image is ~60% smaller
- No TypeScript compiler in production
- No dev dependencies in production
- Faster deployments

### Building Docker Images

```bash
# Standard build
docker build -t mcp-server:latest .

# Build with specific tag
docker build -t mcp-server:v1.0.0 .

# Build without cache
docker build --no-cache -t mcp-server:latest .
```

### Running Docker Containers

```bash
# Run with environment variables
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your-key \
  -e MCP_API_KEY=your-secret \
  mcp-server:latest

# Run with .env file
docker run -p 3000:3000 --env-file .env mcp-server:latest

# Run in background
docker run -d -p 3000:3000 --name mcp-server mcp-server:latest

# View logs
docker logs -f mcp-server

# Stop container
docker stop mcp-server
```

---

## Build Output Structure

After running `npm run build`, you'll have:

```
dist/
├── server.js                   # Stdio server entry point
├── server-http.js              # HTTP server entry point
├── client.js                   # Client entry point
├── server-core.js              # Shared MCP logic
├── src/
│   ├── config/
│   │   └── env.config.js       # Environment configuration
│   └── http/
│       ├── server.js           # HTTP server setup
│       ├── handlers/           # Business logic
│       ├── middleware/         # Express middleware
│       ├── routes/             # API routes
│       └── utils/              # Utilities
└── (source maps, declarations if enabled)
```

---

## TypeScript Configurations

### Standard Build: `tsconfig.json`

- **Output:** `dist/`
- **Source maps:** Yes
- **Declarations:** Yes
- **Comments:** Preserved

```bash
npm run build  # Uses tsconfig.json
```

### Production Build: `tsconfig.prod.json`

- **Output:** `dist/`
- **Source maps:** No (smaller files)
- **Declarations:** No
- **Comments:** Removed

```bash
npm run build:prod  # Uses tsconfig.prod.json
```

**Size difference:**
- Standard build: ~0.8 MB (with source maps)
- Production build: ~0.3 MB (without source maps)

---

## Troubleshooting

### Build fails with "Cannot find module"

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### "dist/ directory does not exist"

```bash
# Build first
npm run build

# Then start
npm start
```

### TypeScript errors in IDE but build succeeds

```bash
# Force type check
npm run type-check

# Restart your IDE's TypeScript server
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Docker build fails

```bash
# Clean Docker cache
npm run docker:clean

# Rebuild from scratch
docker build --no-cache -t mcp-server:latest .
```

### "Port 3000 already in use"

```bash
# Find process on port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
MCP_PORT=3001 npm start
```

### Build verification fails

```bash
# Check what's missing
npm run verify

# Rebuild
npm run build
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run type-check
      - run: npm run build
      - run: npm run verify

      # Optional: Build Docker image
      - run: npm run docker:build
```

### GitLab CI Example

```yaml
build:
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
    - npm run verify
  artifacts:
    paths:
      - dist/
```

---

## Performance Tips

### Faster Builds

1. **Use watch mode during development:**
   ```bash
   npm run dev:watch  # Auto-rebuilds on changes
   ```

2. **Skip verification in development:**
   ```bash
   tsc --noEmit  # Type-check only, no files generated
   ```

3. **Use Docker layer caching:**
   ```dockerfile
   # Copy package files first (cached if unchanged)
   COPY package*.json ./
   RUN npm ci

   # Then copy source (changes more often)
   COPY . .
   ```

### Smaller Builds

1. **Production builds exclude source maps:**
   ```bash
   npm run build:prod  # ~60% smaller
   ```

2. **Docker multi-stage eliminates dev dependencies**

3. **Prune unused dependencies:**
   ```bash
   npm prune --production
   ```

---

## Summary

**Development:**
- `npm run dev` - Start developing immediately
- `npm run dev:watch` - Auto-restart on changes

**Production:**
- `npm run build` - Compile TypeScript
- `npm start` - Run production server

**Docker:**
- `npm run docker:up` - Deploy with one command
- `npm run docker:logs` - Monitor application

**Verification:**
- `npm run type-check` - Catch errors early
- `npm run verify` - Ensure build integrity

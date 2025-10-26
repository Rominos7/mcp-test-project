# Development Guide

Quick reference guide for developers working on the MCP Server project.

## Quick Commands

```bash
# Development
npm run dev              # Start HTTP server (hot reload)
npm run dev:watch        # Auto-restart on changes

# Building
npm run build            # Full build pipeline
npm run type-check       # Check types without building

# Testing
curl http://localhost:3000/health  # Test health endpoint

# Docker
npm run docker:up        # Start in Docker
npm run docker:logs      # View logs
```

## Project Structure

```
mcp-server-weather/
├── src/                          # Source code (refactored)
│   ├── config/
│   │   └── env.config.ts        # Environment variables
│   └── http/
│       ├── server.ts            # Main HTTP server
│       ├── middleware/          # Auth, CORS, security
│       ├── handlers/            # Business logic
│       ├── routes/              # API endpoints
│       └── utils/               # Helper functions
├── scripts/
│   └── verify-build.js          # Build verification
├── server-http.ts               # HTTP entry point
├── server.ts                    # Stdio entry point
├── client.ts                    # Client implementation
├── server-core.ts               # Shared MCP logic
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker orchestration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies & scripts
```

## Adding New Features

### 1. Add a New Tool

Edit [src/http/handlers/tools.handler.ts](src/http/handlers/tools.handler.ts):

```typescript
// 1. Add to list
export async function handleToolsList() {
  return {
    tools: [
      // ... existing tools
      {
        name: "myNewTool",
        description: "Does something cool",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "string" },
          },
          required: ["input"],
        },
      },
    ],
  };
}

// 2. Add handler
async function handleMyNewTool(args: any) {
  const { input } = args;
  // Your logic here
  return {
    content: [{ type: "text", text: result }],
  };
}

// 3. Add to switch statement
export async function handleToolsCall(params: any) {
  switch (name) {
    // ... existing cases
    case "myNewTool":
      return handleMyNewTool(args);
  }
}
```

### 2. Add Middleware

Create new file in [src/http/middleware/](src/http/middleware/):

```typescript
// src/http/middleware/my-middleware.ts
import type { Request, Response, NextFunction } from "express";

export function myMiddleware(req: Request, res: Response, next: NextFunction) {
  // Your middleware logic
  next();
}
```

Then add to [src/http/server.ts](src/http/server.ts):

```typescript
import { myMiddleware } from "./middleware/my-middleware.js";

app.use(myMiddleware);
```

### 3. Add New Route

Create new file in [src/http/routes/](src/http/routes/):

```typescript
// src/http/routes/my-routes.ts
import express from "express";

const router = express.Router();

router.get("/my-endpoint", (req, res) => {
  res.json({ message: "Hello!" });
});

export default router;
```

Then add to [src/http/server.ts](src/http/server.ts):

```typescript
import myRoutes from "./routes/my-routes.js";

app.use(myRoutes);
```

## Environment Variables

Copy [.env.example](.env.example) to `.env`:

```bash
cp .env.example .env
```

Required variables:
- `ANTHROPIC_API_KEY` - For AI summarization tool
- `MCP_API_KEY` - For API authentication (change from default!)

Optional variables:
- `MCP_PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)

## Testing Your Changes

### 1. Type Check

```bash
npm run type-check
```

### 2. Build

```bash
npm run build
```

### 3. Start Server

```bash
npm run dev:http
```

### 4. Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer development-key" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call add tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer development-key" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"add","arguments":{"a":5,"b":3}}}'
```

## Common Tasks

### Update Dependencies

```bash
# Check outdated packages
npm outdated

# Update all
npm update

# Update specific package
npm install express@latest
```

### Clean Build

```bash
npm run clean
npm run build
```

### Debug Build Issues

```bash
# Verbose TypeScript compilation
npx tsc --listFiles

# Check what files are included
npx tsc --showConfig
```

### View Build Output

```bash
# List all built files
ls -R dist/

# Check file sizes
du -h dist/**/*.js
```

## Code Style Guidelines

### TypeScript

- Use `async/await` over Promises
- Export functions explicitly
- Use type imports: `import type { Request } from "express"`
- Prefer interfaces over types for objects

### File Naming

- Handlers: `*.handler.ts`
- Middleware: `*.middleware.ts`
- Routes: `*.routes.ts`
- Config: `*.config.ts`
- Utils: `*.manager.ts`, `*.helper.ts`

### Import Order

1. External packages
2. Internal types
3. Internal modules
4. Config/constants

```typescript
import express from "express";
import type { Request, Response } from "express";
import { myHandler } from "./handlers/my-handler.js";
import { config } from "../config/env.config.js";
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "Add: my new feature"

# Push
git push origin feature/my-feature

# Create pull request on GitHub
```

### Commit Message Format

```
Type: Short description

- Bullet point 1
- Bullet point 2

Types: Add, Update, Fix, Remove, Refactor, Docs
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Check imports have .js extension
import { foo } from "./bar.js"  // ✅
import { foo } from "./bar"     // ❌
```

### TypeScript strict errors

The project uses strict TypeScript. Common fixes:

```typescript
// Add null checks
if (!value) return;

// Use non-null assertion (if you're sure)
const x = value!;

// Provide explicit types
const arr: string[] = [];
```

### Port already in use

```bash
# Find process
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Change port
MCP_PORT=3001 npm run dev
```

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MCP Specification](https://modelcontextprotocol.io/)
- [BUILD.md](BUILD.md) - Build system details
- [.env.example](.env.example) - Configuration options

## Getting Help

1. Check [BUILD.md](BUILD.md) for build issues
2. Review [.env.example](.env.example) for configuration
3. Check TypeScript errors: `npm run type-check`
4. Review build output: `npm run verify`

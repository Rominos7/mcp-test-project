# Node.js Expert Skill

You are now equipped with comprehensive knowledge of **Node.js development best practices**, TypeScript integration, Express.js patterns, npm ecosystem, async programming, error handling, and production-ready application development.

Use this expertise when working with Node.js codebases, managing dependencies, implementing server logic, optimizing performance, and ensuring code quality.

---

## 📋 Table of Contents

1. [Node.js Fundamentals](#nodejs-fundamentals)
2. [TypeScript Integration](#typescript-integration)
3. [Express.js Patterns](#expressjs-patterns)
4. [Package Management (npm/yarn)](#package-management-npmyarn)
5. [Async Programming & Promises](#async-programming--promises)
6. [Worker Threads & CPU-Intensive Tasks](#worker-threads--cpu-intensive-tasks)
7. [Error Handling](#error-handling)
8. [Environment Configuration](#environment-configuration)
9. [Middleware Architecture](#middleware-architecture)
10. [Authentication & Authorization (2025)](#authentication--authorization-2025)
11. [Security Best Practices](#security-best-practices)
12. [Performance Optimization](#performance-optimization)
13. [Testing Strategies](#testing-strategies)
14. [Logging & Monitoring](#logging--monitoring)
15. [Modern DevOps & CI/CD (2025)](#modern-devops--cicd-2025)
16. [Build & Deployment](#build--deployment)
17. [Common Patterns & Anti-Patterns](#common-patterns--anti-patterns)

---

## Node.js Fundamentals

### Event Loop & Non-Blocking I/O

Node.js uses a single-threaded event loop for handling asynchronous operations:

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

**Key Principles:**
- **Non-blocking I/O**: Never block the event loop
- **Async operations**: File I/O, network requests, timers
- **Callbacks → Promises → async/await**: Evolution of async patterns

**Event Loop Phases (Deep Dive):**

1. **Timers** - Executes callbacks scheduled by `setTimeout()` and `setInterval()`
2. **Pending Callbacks** - Executes I/O callbacks deferred to the next loop iteration
3. **Idle, Prepare** - Internal use only
4. **Poll** - Retrieve new I/O events; execute I/O callbacks (most application code runs here)
5. **Check** - `setImmediate()` callbacks execute here
6. **Close Callbacks** - Close event callbacks (e.g., `socket.on('close')`)

**Best Practice:** Use `setImmediate()` for deferred execution instead of `setTimeout(fn, 0)` for better performance.

### Top-Level Await (ES2022+)

Modern Node.js (14.8+) supports top-level await in ES modules:

```typescript
// ✅ Good: Clean async initialization (ES modules only!)
import { config } from './config.js';

const db = await connectToDatabase();
const cache = await initializeCache();

export { db, cache };

// No need to wrap in async IIFE anymore!
```

**Requirements:**
- Must use ES modules (`"type": "module"` in package.json)
- Node.js 14.8+ (stable in 16+)

### Module System

**CommonJS (Legacy):**
```javascript
// Exporting
module.exports = { foo, bar };
exports.baz = () => {};

// Importing
const { foo } = require('./module');
```

**ES Modules (Modern - Preferred):**
```typescript
// Exporting
export const foo = () => {};
export default class Bar {}

// Importing
import { foo } from './module.js';
import Bar from './module.js';
```

**Package.json Configuration:**
```json
{
  "type": "module",  // Enable ES modules
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./client": "./dist/client.js"
  }
}
```

### Process Management

```typescript
// Environment
process.env.NODE_ENV;
process.env.PORT;

// Exit codes
process.exit(0);  // Success
process.exit(1);  // Failure

// Signal handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
```

---

## TypeScript Integration

### tsconfig.json Best Practices

```json
{
  "compilerOptions": {
    // Target & Module
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],

    // Output
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Strict Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Module Resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,

    // Advanced
    "forceConsistentCasingInFileNames": true,
    "removeComments": true,
    "preserveConstEnums": true
  },
  "include": ["src/**/*", "*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Type Safety Patterns

**✅ Good: Strong Typing**
```typescript
interface UserData {
  id: string;
  email: string;
  age: number;
}

function processUser(user: UserData): string {
  return `User ${user.email} is ${user.age} years old`;
}
```

**❌ Bad: Any Types**
```typescript
function processUser(user: any): any {
  return user.email; // No type safety!
}
```

### Type Guards

```typescript
// Type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Usage
function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // TypeScript knows it's a string
  }
}

// Discriminated unions
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // Type-safe access
  } else {
    console.error(result.error);
  }
}
```

### Generic Constraints

```typescript
// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Usage
const user = { id: 1, name: 'Alice' };
const name = getProperty(user, 'name'); // Type: string
// const invalid = getProperty(user, 'invalid'); // Error!
```

---

## Express.js Patterns

### Application Structure

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// ✅ Good: Separate app creation from server startup
export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // Routes
  app.use('/api', apiRoutes);
  app.use('/health', healthRoutes);

  // Error handling (must be last!)
  app.use(errorHandler);

  return app;
}

// Separate server startup
export function startServer(app: Express, port: number) {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server closed');
    });
  });

  return server;
}
```

### Router Patterns

```typescript
import { Router } from 'express';

// ✅ Good: Modular routes
export function createUserRoutes(): Router {
  const router = Router();

  router.get('/', getAllUsers);
  router.get('/:id', getUserById);
  router.post('/', createUser);
  router.put('/:id', updateUser);
  router.delete('/:id', deleteUser);

  return router;
}

// Route handlers with proper typing
async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id;
    const user = await userService.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error); // Pass to error handler
  }
}
```

### Request Validation

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Define schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  name: z.string().min(1).max(100)
});

// Validation middleware factory
function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors
      });
    }

    req.body = result.data; // Use validated data
    next();
  };
}

// Usage
router.post('/users', validateBody(CreateUserSchema), createUser);
```

### Response Helpers

```typescript
// ✅ Good: Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class ResponseHelper {
  static success<T>(res: Response, data: T, status = 200) {
    return res.status(status).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string, status = 500) {
    return res.status(status).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }
}

// Usage
async function getUser(req: Request, res: Response) {
  const user = await userService.find(req.params.id);
  return ResponseHelper.success(res, user);
}
```

---

## Package Management (npm/yarn)

### package.json Best Practices

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My awesome Node.js application",
  "main": "dist/index.js",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "npm run clean && tsc",
    "clean": "rm -rf dist",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^5.1.0",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "typescript": "^5.9.3",
    "tsx": "^4.20.6",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0"
  }
}
```

### Dependency Management

**Version Ranges:**
```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exact version
    "caret": "^1.2.3",          // >=1.2.3 <2.0.0 (default)
    "tilde": "~1.2.3",          // >=1.2.3 <1.3.0
    "range": ">=1.2.3 <2.0.0",  // Explicit range
    "latest": "*"               // Any (avoid!)
  }
}
```

**✅ Best Practices:**
- Use `^` for most dependencies (minor updates)
- Lock versions with `package-lock.json`
- Regular updates: `npm outdated` → `npm update`
- Security: `npm audit` → `npm audit fix`
- Clean installs: `npm ci` (use in CI/CD)

**Dependency Types:**
```bash
# Runtime dependencies
npm install express

# Development dependencies
npm install --save-dev typescript @types/node

# Peer dependencies (for libraries)
# Declared in package.json manually
```

### npm Scripts Patterns

```json
{
  "scripts": {
    // Development
    "dev": "tsx watch src/index.ts",
    "dev:debug": "NODE_OPTIONS='--inspect' tsx watch src/index.ts",

    // Building
    "prebuild": "npm run clean && npm run lint",
    "build": "tsc",
    "postbuild": "npm run verify",

    // Testing
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:coverage": "jest --coverage",

    // Quality
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write 'src/**/*.ts'",
    "type-check": "tsc --noEmit",

    // Utilities
    "clean": "rm -rf dist node_modules/.cache",
    "verify": "node scripts/verify-build.js"
  }
}
```

---

## Async Programming & Promises

### Promise Patterns

**✅ Good: Proper async/await**
```typescript
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

**❌ Bad: Mixing callbacks and promises**
```typescript
async function badExample() {
  return new Promise((resolve) => {
    fetch('/api/data').then(res => { // Don't mix!
      resolve(res.json());
    });
  });
}
```

### Parallel Execution

```typescript
// ✅ Good: Parallel execution
async function fetchMultipleUsers(ids: string[]): Promise<User[]> {
  const promises = ids.map(id => fetchUser(id));
  return Promise.all(promises);
}

// ✅ Good: Parallel with error handling
async function fetchAllWithErrors(ids: string[]) {
  const promises = ids.map(id =>
    fetchUser(id).catch(error => ({ error, id }))
  );
  return Promise.allSettled(promises);
}

// ❌ Bad: Sequential execution (slow!)
async function fetchSequentially(ids: string[]): Promise<User[]> {
  const users: User[] = [];
  for (const id of ids) {
    users.push(await fetchUser(id)); // Waits for each!
  }
  return users;
}
```

### Promise Utilities

```typescript
// Race condition - first to complete
const result = await Promise.race([
  fetchFromPrimary(),
  fetchFromBackup()
]);

// All settled - wait for all (ignores failures)
const results = await Promise.allSettled([
  operation1(),
  operation2(),
  operation3()
]);

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('Success:', result.value);
  } else {
    console.error('Failed:', result.reason);
  }
});

// Any - first successful
const fastestSuccess = await Promise.any([
  fetchFromServer1(),
  fetchFromServer2(),
  fetchFromServer3()
]);
```

### Timeout Pattern

```typescript
function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

// Usage
try {
  const data = await timeout(fetch('/api/data'), 5000);
} catch (error) {
  console.error('Request timed out');
}
```

### Retry Pattern

```typescript
async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retries failed');
}

// Usage
const data = await retry(() => fetch('/api/unstable'), 3, 2000);
```

### Async Iterators (Modern Pattern)

Async iterators provide clean syntax for streaming data:

```typescript
// ✅ Good: Async iterator for paginated data
async function* fetchAllUsers() {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/users?page=${page}`);
    const data = await response.json();

    for (const user of data.users) {
      yield user;
    }

    hasMore = data.hasNextPage;
    page++;
  }
}

// Usage with for-await-of
async function processAllUsers() {
  for await (const user of fetchAllUsers()) {
    console.log(`Processing user: ${user.email}`);
    await sendEmail(user.email);
  }
}
```

**Use cases:**
- Streaming large datasets
- Paginated API responses
- Real-time data processing
- Database cursor iteration

---

## Worker Threads & CPU-Intensive Tasks

Worker threads enable true parallelism for CPU-bound operations without blocking the event loop.

### When to Use Worker Threads

**✅ Use Worker Threads for:**
- Heavy computations (image processing, video encoding)
- Data parsing (large JSON/XML files)
- Cryptographic operations
- Machine learning inference
- Complex mathematical calculations

**❌ Don't Use Worker Threads for:**
- I/O operations (already handled efficiently by async I/O)
- Simple calculations
- Database queries
- Network requests

### Basic Worker Thread Pattern

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  // Main thread: Create worker
  const worker = new Worker(__filename, {
    workerData: { numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
  });

  worker.on('message', (result) => {
    console.log('Result from worker:', result);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
} else {
  // Worker thread: Process data
  const { numbers } = workerData;
  const sum = numbers.reduce((acc: number, n: number) => acc + n, 0);
  parentPort?.postMessage(sum);
}
```

### Worker Pool Pattern

```typescript
import { Worker } from 'worker_threads';
import path from 'path';

class WorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ data: any; resolve: Function; reject: Function }> = [];
  private activeWorkers = 0;

  constructor(
    private workerPath: string,
    private poolSize: number = 4
  ) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerPath);
      this.workers.push(worker);
    }
  }

  async execute<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.queue.length === 0) return;
    if (this.activeWorkers >= this.poolSize) return;

    const worker = this.workers[this.activeWorkers];
    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers++;

    const messageHandler = (result: any) => {
      task.resolve(result);
      cleanup();
    };

    const errorHandler = (error: Error) => {
      task.reject(error);
      cleanup();
    };

    const cleanup = () => {
      worker.off('message', messageHandler);
      worker.off('error', errorHandler);
      this.activeWorkers--;
      this.processQueue();
    };

    worker.once('message', messageHandler);
    worker.once('error', errorHandler);
    worker.postMessage(task.data);
  }

  async terminate() {
    await Promise.all(this.workers.map(w => w.terminate()));
  }
}

// Usage
const pool = new WorkerPool(path.resolve(__dirname, 'worker.js'), 4);

async function processLargeDataset(items: any[]) {
  const results = await Promise.all(
    items.map(item => pool.execute(item))
  );
  return results;
}
```

### Worker Thread for Image Processing

```typescript
// image-worker.ts
import { parentPort, workerData } from 'worker_threads';
import sharp from 'sharp';

async function processImage(buffer: Buffer, width: number, height: number) {
  const processed = await sharp(buffer)
    .resize(width, height)
    .jpeg({ quality: 80 })
    .toBuffer();

  return processed;
}

parentPort?.on('message', async ({ imageBuffer, width, height }) => {
  try {
    const result = await processImage(imageBuffer, width, height);
    parentPort?.postMessage({ success: true, data: result });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

```typescript
// main.ts - Using the worker
import { Worker } from 'worker_threads';
import fs from 'fs/promises';

async function resizeImage(inputPath: string, outputPath: string) {
  const imageBuffer = await fs.readFile(inputPath);

  const worker = new Worker('./image-worker.js');

  return new Promise((resolve, reject) => {
    worker.on('message', async (result) => {
      if (result.success) {
        await fs.writeFile(outputPath, result.data);
        resolve(outputPath);
      } else {
        reject(new Error(result.error));
      }
      await worker.terminate();
    });

    worker.on('error', reject);

    worker.postMessage({
      imageBuffer,
      width: 800,
      height: 600
    });
  });
}
```

### Shared Memory with SharedArrayBuffer

For extreme performance, use shared memory between threads:

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  // Create shared memory
  const sharedBuffer = new SharedArrayBuffer(1024);
  const sharedArray = new Int32Array(sharedBuffer);

  // Initialize data
  sharedArray[0] = 0;

  const workers = [];
  for (let i = 0; i < 4; i++) {
    const worker = new Worker(__filename, {
      workerData: { sharedBuffer }
    });
    workers.push(worker);
  }

  setTimeout(() => {
    console.log('Final count:', sharedArray[0]);
    workers.forEach(w => w.terminate());
  }, 1000);
} else {
  const { sharedBuffer } = workerData;
  const sharedArray = new Int32Array(sharedBuffer);

  // Atomic operations to prevent race conditions
  for (let i = 0; i < 100; i++) {
    Atomics.add(sharedArray, 0, 1);
  }
}
```

**Important:** Always use `Atomics` for shared memory to prevent race conditions!

---

## Error Handling

### Error Hierarchy

```typescript
// Base error class
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, false); // Not operational!
  }
}
```

### Express Error Handler

```typescript
import { Request, Response, NextFunction } from 'express';

// Global error handler (must be last middleware!)
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  // Handle known errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: error.message,
      stack: error.stack
    })
  });
}

// Usage in routes
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User');
    }
    res.json(user);
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

### Try-Catch Wrapper

```typescript
// Async handler wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage - no try-catch needed!
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User');
  }
  res.json(user);
}));
```

### Validation Errors

```typescript
import { z } from 'zod';

function handleValidationError(error: z.ZodError) {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));

  throw new ValidationError(
    `Validation failed: ${errors.map(e => e.field).join(', ')}`
  );
}

// Usage
try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    handleValidationError(error);
  }
  throw error;
}
```

---

## Environment Configuration

### .env File Structure

```bash
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=secret

# API Keys
API_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...

# Security
JWT_SECRET=super-secret-key
SESSION_SECRET=another-secret

# External Services
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.example.com

# Feature Flags
ENABLE_CACHING=true
LOG_LEVEL=debug
```

### Environment Configuration Module

```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenv.config();

// Define schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  HOST: z.string().default('localhost'),

  API_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_CACHING: z.string().transform(val => val === 'true').default('false')
});

// Parse and validate
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

// Export typed config
export const config = parseEnv();

// Type-safe usage
console.log(config.PORT); // number
console.log(config.NODE_ENV); // 'development' | 'production' | 'test'
```

### Multiple Environment Files

```bash
.env                  # Default (committed to git with placeholders)
.env.development      # Development overrides
.env.production       # Production overrides
.env.test            # Test environment
.env.local           # Local overrides (gitignored!)
```

```typescript
// Load correct env file
import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(process.cwd(), `.env.${env}`);

dotenv.config({ path: envPath });
dotenv.config(); // Also load .env as fallback
```

---

## Middleware Architecture

### Middleware Order Matters!

```typescript
import express from 'express';

const app = express();

// 1. Security headers (first!)
app.use(helmet());

// 2. CORS
app.use(cors());

// 3. Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Logging
app.use(requestLogger);

// 5. Authentication (before routes!)
app.use(authMiddleware);

// 6. Routes
app.use('/api', apiRoutes);

// 7. 404 handler
app.use(notFoundHandler);

// 8. Error handler (MUST BE LAST!)
app.use(errorHandler);
```

### Custom Middleware Patterns

```typescript
import { Request, Response, NextFunction } from 'express';

// ✅ Good: Proper middleware signature
export function logRequests(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.path}`);
  next(); // Don't forget to call next()!
}

// ✅ Good: Middleware factory
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
router.delete('/users/:id', requireRole('admin'), deleteUser);
```

### Authentication Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const user = verifyToken(token); // Your JWT verification
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional authentication
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore invalid token, just don't set user
    }
  }

  next();
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Basic rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 attempts
  skipSuccessfulRequests: true
});

// Usage
app.use('/api/', apiLimiter);
app.use('/auth/login', authLimiter);
```

---

## Authentication & Authorization (2025)

Modern authentication patterns for Node.js applications in 2025.

### JWT (JSON Web Tokens) Best Practices

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Token generation
export function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' } // Longer-lived refresh token
  );

  return { accessToken, refreshToken };
}

// Token verification
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

// Authentication middleware with JWT
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Secure Cookie-Based Sessions

```typescript
import express from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// ✅ Good: Secure session configuration
const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'strict', // CSRF protection
    domain: process.env.COOKIE_DOMAIN
  },
  name: 'sessionId' // Don't use default 'connect.sid'
}));
```

### OAuth 2.0 Integration (Google Example)

```typescript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});

// Generate OAuth URL
router.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    state: generateStateToken() // CSRF protection
  });
  res.redirect(authUrl);
});

// Handle OAuth callback
router.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  // Verify state token
  if (!verifyStateToken(state as string)) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const user = await findOrCreateUser({
      email: payload!.email!,
      name: payload!.name!,
      googleId: payload!.sub
    });

    const appTokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Set HTTP-only cookie
    res.cookie('refreshToken', appTokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken: appTokens.accessToken, user });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});
```

### Two-Factor Authentication (2FA)

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate 2FA secret
export async function generate2FASecret(userId: string, email: string) {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${email})`,
    issuer: 'MyApp'
  });

  // Generate QR code for mobile apps
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Store secret.base32 in database (encrypted!)
  await db.users.update(userId, {
    twoFactorSecret: encrypt(secret.base32)
  });

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
}

// Verify 2FA token
export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock drift
  });
}

// Login with 2FA
router.post('/auth/login', async (req, res) => {
  const { email, password, twoFactorToken } = req.body;

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    if (!twoFactorToken) {
      return res.status(401).json({
        error: '2FA required',
        requires2FA: true
      });
    }

    const secret = decrypt(user.twoFactorSecret);
    if (!verify2FAToken(secret, twoFactorToken)) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }
  }

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  res.json({ accessToken: tokens.accessToken, user });
});
```

### Role-Based Access Control (RBAC)

```typescript
enum Permission {
  READ_USERS = 'users:read',
  WRITE_USERS = 'users:write',
  DELETE_USERS = 'users:delete',
  READ_ADMIN = 'admin:read',
  WRITE_ADMIN = 'admin:write'
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  user: [Permission.READ_USERS],
  moderator: [Permission.READ_USERS, Permission.WRITE_USERS],
  admin: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_ADMIN,
    Permission.WRITE_ADMIN
  ]
};

// Permission check middleware
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
router.delete(
  '/users/:id',
  authenticate,
  requirePermission(Permission.DELETE_USERS),
  deleteUser
);
```

### Brute Force Protection

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

// Brute force protection for login
const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_fail',
  points: 5, // Number of attempts
  duration: 60 * 15, // 15 minutes
  blockDuration: 60 * 60 // Block for 1 hour after max attempts
});

// Alternative: express-brute
import ExpressBrute from 'express-brute';
import RedisStore from 'express-brute-redis';

const bruteStore = new RedisStore({
  client: redisClient
});

const bruteForce = new ExpressBrute(bruteStore, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000, // 5 minutes
  maxWait: 60 * 60 * 1000, // 1 hour
  failCallback: (req, res) => {
    res.status(429).json({
      error: 'Too many failed attempts. Try again later.'
    });
  }
});

// Apply to login route
router.post('/auth/login', bruteForce.prevent, loginHandler);
```

### Password Security

```typescript
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Strong password validation
const PasswordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Higher = more secure but slower
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Password change endpoint
router.post('/auth/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate new password
  const validation = PasswordSchema.safeParse(newPassword);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid password',
      details: validation.error.errors
    });
  }

  const user = await findUserById(req.user!.userId);

  // Verify current password
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }

  // Check if new password is different
  if (await verifyPassword(newPassword, user.passwordHash)) {
    return res.status(400).json({
      error: 'New password must be different from current password'
    });
  }

  // Update password
  const newHash = await hashPassword(newPassword);
  await db.users.update(user.id, { passwordHash: newHash });

  res.json({ success: true });
});
```

---

## Security Best Practices

### Input Sanitization

```typescript
import validator from 'validator';
import { escape } from 'html-escaper';

// ✅ Good: Sanitize user input
function sanitizeInput(input: string): string {
  return validator.trim(escape(input));
}

// ✅ Good: Validate email
function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

// ✅ Good: Validate URL
function isValidUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
}
```

### Helmet.js Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### Secret Management

```typescript
// ❌ Bad: Hardcoded secrets
const API_KEY = 'sk-1234567890';

// ✅ Good: Environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// ✅ Better: Use secret management service
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return response.SecretString || '';
}
```

### SQL Injection Prevention

```typescript
// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`; // NEVER!

// ✅ Good: Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// ✅ Good: ORM with type safety
const user = await User.findOne({ where: { email } });
```

---

## Performance Optimization

### Caching Strategies

```typescript
// In-memory cache with TTL
class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();

  set(key: string, value: T, ttlMs: number = 60000) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const userCache = new SimpleCache<User>();

async function getUserWithCache(id: string): Promise<User> {
  const cached = userCache.get(id);
  if (cached) return cached;

  const user = await db.findUser(id);
  userCache.set(id, user, 5 * 60 * 1000); // 5 minutes
  return user;
}
```

### Compression

```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### Response Streaming

```typescript
import { Readable } from 'stream';

// Stream large datasets
router.get('/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');

  const dataStream = new Readable({
    async read() {
      try {
        const batch = await fetchNextBatch(); // Get data in chunks
        if (batch.length === 0) {
          this.push(null); // End stream
        } else {
          this.push(JSON.stringify(batch));
        }
      } catch (error) {
        this.destroy(error);
      }
    }
  });

  dataStream.pipe(res);
});
```

### Connection Pooling

```typescript
import { Pool } from 'pg';

// ✅ Good: Use connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Query with pool
async function query(text: string, params: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release(); // Return to pool
  }
}
```

---

## Testing Strategies

### Unit Testing with Jest

```typescript
// user.service.test.ts
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

// Mock dependencies
jest.mock('./user.repository');

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById('1');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.findById('999'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
```

### Integration Testing

```typescript
// app.test.ts
import request from 'supertest';
import { createApp } from './app';

describe('API Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/users/:id', () => {
    it('should return user when exists', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/users/1')
        .expect(401);
    });
  });
});
```

### Test Utilities

```typescript
// test-utils.ts
export function createMockRequest(overrides = {}): Partial<Request> {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides
  };
}

export function createMockResponse(): Partial<Response> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

export const mockNext: NextFunction = jest.fn();
```

---

## Logging & Monitoring

### Structured Logging with Winston

```typescript
import winston from 'winston';

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Usage
logger.info('User created', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', { error: error.message });
logger.debug('Request received', { method: req.method, path: req.path });
```

### High-Performance Logging with Pino (2025 Recommended)

```typescript
import pino from 'pino';

// ✅ Best: Pino is 5x faster than Winston
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

// Usage with Express
import pinoHttp from 'pino-http';

app.use(pinoHttp({ logger }));

// Usage in code
logger.info({ userId: '123', action: 'created' }, 'User created');
logger.error({ err: error }, 'Database error');
```

### Application Performance Monitoring (APM)

**Datadog Integration:**

```typescript
import tracer from 'dd-trace';

// Initialize Datadog APM
tracer.init({
  service: 'my-app',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  logInjection: true,
  runtimeMetrics: true
});

export default tracer;

// Custom spans for performance monitoring
import { tracer } from './datadog';

async function complexOperation() {
  const span = tracer.startSpan('complex.operation');

  try {
    const result = await performWork();
    span.setTag('result.count', result.length);
    return result;
  } catch (error) {
    span.setTag('error', true);
    span.log({ event: 'error', message: error.message });
    throw error;
  } finally {
    span.finish();
  }
}
```

**New Relic Integration:**

```typescript
import newrelic from 'newrelic';

// Track custom metrics
newrelic.recordMetric('Custom/UserSignups', 1);
newrelic.recordMetric('Custom/ResponseTime', responseTime);

// Custom instrumentation
newrelic.startWebTransaction('/api/users', async function handler() {
  const users = await fetchUsers();
  return users;
});

// Track errors
newrelic.noticeError(error, {
  userId: user.id,
  endpoint: req.path
});
```

### Request Logging Middleware

```typescript
import morgan from 'morgan';

// Development: verbose
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Production: JSON format
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Custom format
app.use(morgan((tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    userAgent: tokens['user-agent'](req, res)
  });
}));
```

---

## Modern DevOps & CI/CD (2025)

Modern development workflows with automation, quality checks, and deployment pipelines.

### Git Hooks with Husky & lint-staged

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# Install husky and lint-staged
npm install --save-dev husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Add commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run type-check

# Run tests
npm test -- --bail --findRelatedTests
```

**.husky/pre-push:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite before pushing
npm run test:coverage

# Ensure build works
npm run build
```

### ESLint Flat Config (2025 Standard)

```typescript
// eslint.config.mjs
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js']
  }
];
```

### GitHub Actions CI/CD Pipeline

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

      - name: Build
        run: npm run build

      - name: Verify build
        run: npm run verify

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Dependency review
        uses: actions/dependency-review-action@v4
```

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to production
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        run: |
          npm run deploy:production

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Conventional Commits with Commitlint

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'perf',     // Performance
        'test',     // Tests
        'chore',    // Maintenance
        'ci',       // CI/CD changes
        'build'     // Build system
      ]
    ],
    'subject-case': [2, 'always', 'sentence-case']
  }
};
```

**Example commits:**
```bash
feat: add user authentication with JWT
fix: resolve memory leak in worker pool
docs: update API documentation
refactor: simplify error handling middleware
perf: optimize database queries with indexing
```

### Semantic Release Automation

```json
// package.json
{
  "scripts": {
    "semantic-release": "semantic-release"
  },
  "devDependencies": {
    "semantic-release": "^22.0.0",
    "@semantic-release/changelog": "^6.0.0",
    "@semantic-release/git": "^10.0.0"
  }
}
```

**.releaserc.json:**
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

### Message Queues & Background Jobs

**Bull/BullMQ for Redis-based queues:**

```typescript
import { Queue, Worker } from 'bullmq';
import { createClient } from 'redis';

const connection = createClient({ url: process.env.REDIS_URL });
await connection.connect();

// Create queue
export const emailQueue = new Queue('emails', { connection });

// Add job to queue
await emailQueue.add('welcome-email', {
  userId: '123',
  email: 'user@example.com'
});

// Process jobs
const worker = new Worker('emails', async (job) => {
  const { email, userId } = job.data;

  switch (job.name) {
    case 'welcome-email':
      await sendWelcomeEmail(email);
      break;
    case 'password-reset':
      await sendPasswordResetEmail(email);
      break;
  }

  return { processed: true };
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

**Advanced queue features:**

```typescript
// Scheduled jobs
await emailQueue.add(
  'weekly-digest',
  { userId: '123' },
  { repeat: { pattern: '0 9 * * 1' } } // Every Monday at 9 AM
);

// Priority queue
await emailQueue.add('urgent-notification', data, { priority: 1 });
await emailQueue.add('regular-notification', data, { priority: 5 });

// Job retry with exponential backoff
await emailQueue.add('api-call', data, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Job result handling
const job = await emailQueue.add('fetch-data', { url: '/api/data' });
const result = await job.waitUntilFinished(queueEvents);
console.log('Job result:', result);
```

---

## Build & Deployment

### Build Process

```json
{
  "scripts": {
    "prebuild": "npm run clean && npm run lint",
    "build": "tsc",
    "postbuild": "npm run verify",
    "clean": "rm -rf dist",
    "verify": "node scripts/verify-build.js"
  }
}
```

**verify-build.js:**
```javascript
import fs from 'fs';
import path from 'path';

const requiredFiles = ['index.js', 'server.js'];
const distPath = path.join(process.cwd(), 'dist');

console.log('Verifying build...');

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('Build verification passed!');
```

### Docker Best Practices

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Security: Run as non-root
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
```

### Process Managers

**PM2 Configuration (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'my-app',
    script: './dist/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: false,
    max_memory_restart: '500M',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

---

## Common Patterns & Anti-Patterns

### ✅ Patterns to Follow

**1. Dependency Injection**
```typescript
// ✅ Good: Inject dependencies
class UserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService
  ) {}

  async createUser(data: CreateUserData) {
    const user = await this.repository.create(data);
    await this.emailService.sendWelcome(user.email);
    return user;
  }
}

// Easy to test with mocks!
const service = new UserService(mockRepository, mockEmailService);
```

**2. Repository Pattern**
```typescript
// Separate data access from business logic
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
  // ... other methods
}
```

**3. Service Layer**
```typescript
// Business logic in services
class UserService {
  async registerUser(data: RegisterData): Promise<User> {
    // Validate
    await this.validateEmailUnique(data.email);

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.repository.create({
      ...data,
      password: hashedPassword
    });

    // Send email
    await this.emailService.sendWelcome(user.email);

    return user;
  }
}
```

**4. Factory Pattern**
```typescript
// Create complex objects
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(authMiddleware);

  app.use('/api', apiRoutes);
  app.use(errorHandler);

  return app;
}

// Easy to test and configure
const app = createApp();
```

### ❌ Anti-Patterns to Avoid

**1. Callback Hell**
```typescript
// ❌ Bad: Nested callbacks
function getUser(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) return callback(err);
    db.query('SELECT * FROM posts WHERE user_id = ?', [id], (err, posts) => {
      if (err) return callback(err);
      db.query('SELECT * FROM comments WHERE user_id = ?', [id], (err, comments) => {
        if (err) return callback(err);
        callback(null, { user, posts, comments });
      });
    });
  });
}

// ✅ Good: async/await
async function getUser(id: string) {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  const posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [id]);
  const comments = await db.query('SELECT * FROM comments WHERE user_id = $1', [id]);
  return { user, posts, comments };
}
```

**2. God Objects**
```typescript
// ❌ Bad: One class does everything
class UserManager {
  createUser() {}
  deleteUser() {}
  sendEmail() {}
  hashPassword() {}
  validateEmail() {}
  generateToken() {}
  uploadAvatar() {}
  // ... 50 more methods
}

// ✅ Good: Separation of concerns
class UserService {
  constructor(
    private repository: UserRepository,
    private emailService: EmailService,
    private authService: AuthService,
    private storageService: StorageService
  ) {}
}
```

**3. Synchronous I/O**
```typescript
// ❌ Bad: Blocking operations
const data = fs.readFileSync('large-file.json'); // Blocks entire server!

// ✅ Good: Non-blocking
const data = await fs.promises.readFile('large-file.json');
```

**4. Missing Error Handling**
```typescript
// ❌ Bad: Unhandled promise rejection
async function processData() {
  const data = await fetchData(); // What if this fails?
  return transform(data);
}

// ✅ Good: Proper error handling
async function processData() {
  try {
    const data = await fetchData();
    return transform(data);
  } catch (error) {
    logger.error('Failed to process data', { error });
    throw new ProcessingError('Data processing failed');
  }
}
```

**5. Hardcoded Configuration**
```typescript
// ❌ Bad: Hardcoded values
const server = app.listen(3000, 'localhost');

// ✅ Good: Environment-based
const server = app.listen(
  Number(process.env.PORT || 3000),
  process.env.HOST || 'localhost'
);
```

---

## Quick Reference Checklist

When working with Node.js projects, verify:

- [ ] TypeScript strict mode enabled
- [ ] Environment variables validated at startup
- [ ] All async operations use async/await (not callbacks)
- [ ] Proper error handling in all routes
- [ ] Input validation before processing
- [ ] Secrets loaded from environment (never hardcoded)
- [ ] Middleware in correct order
- [ ] Error handler is last middleware
- [ ] Database connections use connection pooling
- [ ] Graceful shutdown handlers for SIGTERM
- [ ] Logging configured for production
- [ ] Dependencies up to date (`npm outdated`)
- [ ] Security audit passed (`npm audit`)
- [ ] TypeScript compiles without errors
- [ ] Tests pass before deployment

---

## Usage Instructions

When this skill is invoked, use it to:

1. **Implement Node.js features** - Follow established patterns and best practices
2. **Debug Node.js issues** - Check async handling, error handling, and middleware order
3. **Review code quality** - Verify against TypeScript, Express, and security guidelines
4. **Optimize performance** - Apply caching, compression, and connection pooling strategies
5. **Structure applications** - Use layered architecture (routes → services → repositories)
6. **Manage dependencies** - Update, audit, and configure packages properly
7. **Deploy applications** - Build, containerize, and configure for production

**Remember**: Prioritize type safety, error handling, security, and maintainability!

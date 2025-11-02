# MCP Protocol Expert Skill

You are now equipped with comprehensive knowledge of the **Model Context Protocol (MCP)** specification and best practices. Use this expertise when working with MCP servers, clients, tools, resources, prompts, and transport layers.

---

## 📋 Table of Contents

1. [Core Protocol Concepts](#core-protocol-concepts)
2. [JSON-RPC 2.0 Foundation](#json-rpc-20-foundation)
3. [Tools](#tools)
4. [Resources](#resources)
5. [Prompts](#prompts)
6. [Transport Layers](#transport-layers)
7. [Lifecycle & Initialization](#lifecycle--initialization)
8. [Error Handling](#error-handling)
9. [Security & Trust](#security--trust)
10. [Best Practices & Anti-Patterns](#best-practices--anti-patterns)
11. [TypeScript Type Definitions](#typescript-type-definitions)
12. [Official Documentation Links](#official-documentation-links)

---

## Core Protocol Concepts

### Architecture Overview

MCP follows a **client-server architecture** with three main entities:

- **Hosts**: LLM applications (like Claude Desktop) that initiate connections
- **Clients**: Connectors within the host application that manage the protocol
- **Servers**: Services that provide context, data, and capabilities to the LLM

```
┌─────────────────────────────────────────┐
│           Host Application              │
│  (e.g., Claude Desktop, IDE, CLI)       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │      MCP Client                   │  │
│  │  - Manages connections            │  │
│  │  - Handles capability negotiation │  │
│  │  - Routes requests/responses      │  │
│  └───────────┬───────────────────────┘  │
└──────────────┼──────────────────────────┘
               │
               │ JSON-RPC 2.0 over Transport
               │ (stdio, HTTP, SSE)
               │
┌──────────────▼──────────────────────────┐
│         MCP Server                      │
│  ┌──────────────────────────────────┐   │
│  │  Capabilities                    │   │
│  │  • Tools      (executable fns)   │   │
│  │  • Resources  (data sources)     │   │
│  │  • Prompts    (templates)        │   │
│  │  • Sampling   (client-provided)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Core Capabilities

Servers can offer these feature types:

1. **Tools**: Functions that the AI model can execute
   - Example: `add(a, b)`, `summarize(text)`, `fetchWeather(location)`
   - Model-controlled invocation

2. **Resources**: Context and data for the user or AI model
   - Example: File contents, database records, API responses
   - URI-based addressing (`file://path`, `db://table/id`)

3. **Prompts**: Templated messages and workflows
   - Example: Pre-formatted messages, code review templates
   - User-initiated workflows

4. **Sampling** (Optional): Client-provided AI capabilities
   - Servers can request AI assistance from the client
   - Enables recursive LLM interactions

---

## JSON-RPC 2.0 Foundation

MCP uses **JSON-RPC 2.0** for all client-server communication.

### Message Types

#### 1. Request (expects response)

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "tools/call",
  "params": {
    "name": "calculator",
    "arguments": {
      "operation": "add",
      "a": 5,
      "b": 3
    }
  }
}
```

**Required fields:**
- `jsonrpc`: MUST be exactly `"2.0"`
- `id`: Unique identifier (string or number)
- `method`: Case-sensitive method name (uses `/` separators)
- `params`: Object or array (optional, but must be valid if present)

#### 2. Response (successful)

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "8"
      }
    ]
  }
}
```

#### 3. Response (error)

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "field": "a",
      "reason": "Must be a number",
      "received": "five"
    }
  }
}
```

#### 4. Notification (no response expected)

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/changed",
  "params": {
    "uri": "file://config.json"
  }
}
```

**Key difference**: No `id` field!

### Standard Error Codes

| Code | Name | Meaning |
|------|------|---------|
| `-32700` | PARSE_ERROR | Invalid JSON received by server |
| `-32600` | INVALID_REQUEST | Message missing required fields |
| `-32601` | METHOD_NOT_FOUND | Unknown method or unimplemented capability |
| `-32602` | INVALID_PARAMS | Parameter validation failed |
| `-32603` | INTERNAL_ERROR | Server-side processing failure |

### MCP Method Namespaces

All MCP methods follow the pattern: `namespace/method`

**Core methods:**
- `initialize` - Handshake and capability negotiation
- `tools/list` - Discover available tools
- `tools/call` - Execute a tool
- `resources/list` - Browse available resources
- `resources/read` - Retrieve resource content
- `prompts/list` - Discover available prompts
- `prompts/get` - Retrieve prompt content
- `notifications/*` - Server-to-client notifications

**Important**: Method names are **case-sensitive**!

---

## Tools

Tools are **executable functions** that the AI model can invoke.

### Tool Definition Schema

```typescript
interface ToolDefinition {
  name: string;           // 1-128 chars, alphanumeric + underscore/dash/dot
  title?: string;         // Human-readable display name
  description: string;    // Clear explanation for users
  inputSchema: JSONSchema; // JSON Schema for parameters
  outputSchema?: JSONSchema; // Optional: expected result structure
  annotations?: {         // Metadata (only trusted servers)
    audience?: string[];
    priority?: number;
  };
}
```

### Tool Naming Conventions

**Valid names:**
- `add`, `getUser`, `DATA_EXPORT_v2`, `admin.tools.list`
- Alphanumeric characters, underscores, hyphens, dots
- 1-128 characters, case-sensitive

**Invalid names:**
- `my tool` (contains space)
- `fetch@data` (contains `@`)
- Empty string or >128 characters

### Input Schema Format (JSON Schema)

```json
{
  "name": "fetchWeather",
  "description": "Fetch current weather for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or zip code"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature units"
      }
    },
    "required": ["location"]
  }
}
```

### tools/list Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {
    "cursor": "optional-pagination-token"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "fetchWeather",
        "title": "Weather Fetcher",
        "description": "Fetch current weather for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": { "type": "string" },
            "units": { "type": "string", "enum": ["celsius", "fahrenheit"] }
          },
          "required": ["location"]
        }
      }
    ],
    "nextCursor": "optional-next-page-token"
  }
}
```

### tools/call Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "fetchWeather",
    "arguments": {
      "location": "London",
      "units": "celsius"
    }
  }
}
```

**Response (Success):**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Temperature: 18°C, Conditions: Partly cloudy"
      }
    ],
    "isError": false
  }
}
```

**Response (Tool Execution Error):**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Weather API rate limit exceeded. Please try again later."
      }
    ],
    "isError": true
  }
}
```

**Note**: Tool execution errors use `isError: true`, NOT JSON-RPC error responses!

### Tool Response Content Types

Tools can return multiple content types:

```typescript
type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: "audio"; data: string; mimeType: string }
  | { type: "resource"; uri: string; mimeType?: string };
```

**Example with image:**
```json
{
  "content": [
    {
      "type": "image",
      "data": "base64-encoded-image-data",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "Generated chart showing temperature trends"
    }
  ]
}
```

---

## Resources

Resources are **data sources** that provide context to the AI model.

### Resource Definition Schema

```typescript
interface ResourceDefinition {
  name: string;
  title?: string;
  description: string;
  uriTemplate: string;    // URI pattern with placeholders
  mimeType?: string;      // Content MIME type
}
```

### URI Templates

Resources use URI templates with placeholders:

```typescript
// Example: file://{path}
const resourceDef = {
  name: "configFile",
  uriTemplate: "file://{path}",
  mimeType: "application/json"
};

// Clients can read:
// - file://config.json
// - file://settings/app.json
// - file://data/users.json
```

### resources/list Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/list"
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resources": [
      {
        "name": "configFile",
        "title": "Configuration Files",
        "description": "Access application configuration files",
        "uriTemplate": "file://{path}",
        "mimeType": "application/json"
      }
    ]
  }
}
```

### resources/read Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/read",
  "params": {
    "uri": "file://config.json"
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "contents": [
      {
        "uri": "file://config.json",
        "mimeType": "application/json",
        "text": "{\"port\": 3000, \"debug\": true}"
      }
    ]
  }
}
```

---

## Prompts

Prompts are **templated messages** that users can invoke.

### Prompt Definition Schema

```typescript
interface PromptDefinition {
  name: string;
  title?: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}
```

### prompts/list Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "prompts/list"
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "prompts": [
      {
        "name": "codeReview",
        "title": "Code Review Assistant",
        "description": "Generate a code review for the provided code",
        "arguments": [
          {
            "name": "code",
            "description": "Code to review",
            "required": true
          },
          {
            "name": "language",
            "description": "Programming language",
            "required": false
          }
        ]
      }
    ]
  }
}
```

### prompts/get Request/Response

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "prompts/get",
  "params": {
    "name": "codeReview",
    "arguments": {
      "code": "function add(a, b) { return a + b; }",
      "language": "javascript"
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "Please review this JavaScript code:\n\nfunction add(a, b) { return a + b; }"
        }
      }
    ]
  }
}
```

---

## Transport Layers

MCP supports multiple transport mechanisms for different use cases.

### 1. Stdio Transport (Local)

**Use case**: Local client and server on the same machine

**How it works:**
- Server reads from `stdin`, writes to `stdout`
- Client spawns server as subprocess
- Direct pipe communication
- No authentication needed

**Characteristics:**
```
Client Process          Server Process
    ┌─────┐                ┌─────┐
    │     │─── stdin ─────>│     │
    │     │<── stdout ─────│     │
    │     │─── stderr ────>│     │
    └─────┘                └─────┘
```

**Pros:**
- Simple, fast, low overhead
- No network configuration
- Ideal for local integrations

**Cons:**
- Single machine only
- Can't work across networks or containers

### 2. HTTP Transport (Remote)

**Use case**: Remote connections, Docker, cloud deployments

**How it works:**
- JSON-RPC 2.0 over HTTP POST requests
- Session-based with timeout management
- Bearer token authentication
- CORS support for web clients

**Request headers:**
```http
POST /mcp HTTP/1.1
Content-Type: application/json
Authorization: Bearer your-api-key
Mcp-Session-Id: session-123
```

**Response headers:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Mcp-Session-Id: session-123
```

**Pros:**
- Works across networks
- Standard HTTP tooling
- Docker/cloud compatible
- Firewall-friendly (port 80/443)

**Cons:**
- More complex setup
- Requires authentication
- Session management overhead

### 3. SSE Transport (Server-Sent Events)

**Use case**: Streaming responses, real-time updates

**How it works:**
- Server pushes updates to client
- One-way streaming from server to client
- Built on HTTP (no WebSocket needed)

**Characteristics:**
- Long-lived HTTP connection
- Event stream format
- Automatic reconnection

**Status**: Mentioned in specification, less commonly implemented

---

## Lifecycle & Initialization

Every MCP connection follows a **three-step handshake**:

### Step 1: Client → Server (Initialize Request)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    },
    "capabilities": {
      "sampling": {}
    }
  }
}
```

### Step 2: Server → Client (Initialize Response)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "serverInfo": {
      "name": "ExampleServer",
      "version": "0.1.0"
    },
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "listChanged": false },
      "prompts": { "listChanged": false }
    }
  }
}
```

**Capability flags:**
- `listChanged`: Server will send notifications when list changes
- `subscribe`: Client can subscribe to resource updates

### Step 3: Client → Server (Initialized Notification)

```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

**After this handshake:**
- Both parties know supported features
- Clients can call tools, read resources, get prompts
- Servers can send notifications (if supported)

---

## Error Handling

### Two Types of Errors

#### 1. Protocol Errors (JSON-RPC errors)

Use these for **protocol-level failures**:

- Unknown method → `-32601 METHOD_NOT_FOUND`
- Invalid parameters → `-32602 INVALID_PARAMS`
- Malformed JSON → `-32700 PARSE_ERROR`

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Method not found",
    "data": {
      "method": "tools/unknownMethod",
      "available": ["tools/list", "tools/call"]
    }
  }
}
```

#### 2. Tool Execution Errors (isError flag)

Use these for **runtime failures** during tool execution:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error: Database connection failed. Please check network connectivity."
      }
    ],
    "isError": true
  }
}
```

**When to use which:**

| Scenario | Error Type | Example |
|----------|------------|---------|
| Unknown tool name | Protocol error (-32601) | Tool "xyz" not found |
| Invalid parameter type | Protocol error (-32602) | Expected number, got string |
| Database error during execution | Tool execution error | isError: true |
| API rate limit exceeded | Tool execution error | isError: true |
| Malformed JSON request | Protocol error (-32700) | Parse error |
| Tool timeout | Tool execution error | isError: true |
| Authentication failure | Protocol error (-32603) | Internal error |

---

## Security & Trust

### Core Security Principles

1. **Explicit User Consent**
   - Hosts MUST obtain explicit user consent before exposing user data to servers
   - Tool invocations should show confirmation prompts for sensitive operations

2. **Untrusted Tool Descriptions**
   - Tool descriptions are considered **untrusted** unless from a verified server
   - Clients should sanitize and validate tool metadata

3. **Human in the Loop**
   - There SHOULD always be a human in the loop
   - Show tool inputs before execution to prevent data exfiltration

4. **Input Validation**
   - Validate all inputs against schema
   - Sanitize outputs to prevent injection attacks

5. **Access Controls**
   - Implement proper authentication (Bearer tokens for HTTP)
   - Rate limit tool invocations
   - Maintain audit logs

### Security Best Practices

```typescript
// ✅ Good: Validate inputs
function executeTool(args: unknown) {
  const validated = inputSchema.parse(args); // Throws if invalid
  return processValidatedInput(validated);
}

// ❌ Bad: Trust inputs blindly
function executeTool(args: any) {
  return eval(args.code); // NEVER DO THIS!
}
```

### Authentication Patterns

**HTTP Transport:**
```typescript
// Server-side middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!isValidToken(token)) {
    return res.status(401).json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32603,
        message: "Unauthorized"
      }
    });
  }
  next();
});
```

### CORS Configuration

```typescript
import cors from "cors";

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});

app.use("/mcp", limiter);
```

---

## Best Practices & Anti-Patterns

### ✅ Best Practices

#### 1. Separation of Concerns

```typescript
// ✅ Good: Separate definition from implementation
interface ToolConfig {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

const toolDefinition: ToolConfig = {
  name: "calculator",
  description: "Perform arithmetic operations",
  inputSchema: { /* ... */ }
};

async function executeCalculator(args: CalculatorArgs) {
  // Implementation
}
```

#### 2. Graceful Error Handling

```typescript
// ✅ Good: Return errors as content
try {
  const result = await externalAPI.call();
  return {
    content: [{ type: "text", text: result }]
  };
} catch (error) {
  return {
    content: [{
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    }],
    isError: true
  };
}
```

#### 3. Input Validation with Schema

```typescript
// ✅ Good: Define and validate against schema
const inputSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email"
    },
    age: {
      type: "number",
      minimum: 0,
      maximum: 150
    }
  },
  required: ["email"]
};

// Validate before processing
function validateInput(data: unknown) {
  // Use JSON Schema validator or Zod
  return validator.validate(data, inputSchema);
}
```

#### 4. Type Safety

```typescript
// ✅ Good: Strong typing
interface WeatherArgs {
  location: string;
  units: "celsius" | "fahrenheit";
}

async function fetchWeather(args: WeatherArgs): Promise<ToolResponse> {
  // Type-safe implementation
}
```

#### 5. Descriptive Tool Metadata

```typescript
// ✅ Good: Clear, helpful descriptions
{
  name: "fetchWeather",
  title: "Weather Fetcher",
  description: "Fetch current weather conditions for a given city or zip code. Supports temperature units in Celsius or Fahrenheit.",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name (e.g., 'London', 'New York') or zip code (e.g., '10001', 'SW1A 1AA')"
      },
      units: {
        type: "string",
        enum: ["celsius", "fahrenheit"],
        description: "Temperature unit preference"
      }
    },
    required: ["location"]
  }
}
```

#### 6. Proper Logging and Monitoring

```typescript
// ✅ Good: Log important events
async function executeTool(name: string, args: unknown) {
  logger.info(`Tool execution started: ${name}`, { args });

  try {
    const result = await toolHandlers[name](args);
    logger.info(`Tool execution succeeded: ${name}`);
    return result;
  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, { error });
    throw error;
  }
}
```

### ❌ Anti-Patterns

#### 1. Throwing Errors from Tool Handlers

```typescript
// ❌ Bad: Don't throw exceptions
async function executeTool(args) {
  if (!args.valid) {
    throw new Error("Invalid input"); // This breaks the protocol!
  }
}

// ✅ Good: Return error content
async function executeTool(args) {
  if (!args.valid) {
    return {
      content: [{ type: "text", text: "Error: Invalid input" }],
      isError: true
    };
  }
}
```

#### 2. Hardcoding Credentials

```typescript
// ❌ Bad: Hardcoded secrets
const API_KEY = "sk-1234567890abcdef";

// ✅ Good: Environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is required");
}
```

#### 3. Ignoring Protocol Version

```typescript
// ❌ Bad: Assume latest version
const response = await client.initialize({});

// ✅ Good: Specify protocol version
const response = await client.initialize({
  protocolVersion: "2025-03-26",
  clientInfo: { name: "MyClient", version: "1.0.0" }
});
```

#### 4. No Input Validation

```typescript
// ❌ Bad: Trust all inputs
async function executeTool(args: any) {
  return executeSQL(args.query); // SQL injection risk!
}

// ✅ Good: Validate and sanitize
async function executeTool(args: { query: string }) {
  const validated = validateSQLQuery(args.query);
  if (!validated.safe) {
    return {
      content: [{ type: "text", text: "Error: Invalid SQL query" }],
      isError: true
    };
  }
  return executeSQL(validated.query);
}
```

#### 5. Ambiguous Error Messages

```typescript
// ❌ Bad: Unhelpful error
return {
  content: [{ type: "text", text: "Error" }],
  isError: true
};

// ✅ Good: Descriptive error
return {
  content: [{
    type: "text",
    text: "Error: Failed to fetch weather data. The weather API returned a 404 error for location 'XYZ'. Please verify the city name or zip code and try again."
  }],
  isError: true
};
```

#### 6. Blocking Operations Without Timeouts

```typescript
// ❌ Bad: No timeout
async function executeTool(args) {
  const result = await infiniteOperation(); // Could hang forever
  return result;
}

// ✅ Good: Implement timeout
async function executeTool(args) {
  const timeout = 30000; // 30 seconds
  const result = await Promise.race([
    performOperation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeout)
    )
  ]);
  return result;
}
```

---

## TypeScript Type Definitions

### Core MCP Types

```typescript
// Tool Definition
interface ToolDefinition {
  name: string;
  title?: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema?: JSONSchema;
  annotations?: {
    audience?: string[];
    priority?: number;
  };
}

// Tool Call Response
interface ToolCallResponse {
  content: ContentBlock[];
  isError?: boolean;
}

// Content Block (union type)
type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string }
  | { type: "audio"; data: string; mimeType: string }
  | { type: "resource"; uri: string; mimeType?: string };

// Resource Definition
interface ResourceDefinition {
  name: string;
  title?: string;
  description: string;
  uriTemplate: string;
  mimeType?: string;
}

// Resource Read Response
interface ResourceReadResponse {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  }>;
}

// Prompt Definition
interface PromptDefinition {
  name: string;
  title?: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

// Prompt Get Response
interface PromptGetResponse {
  messages: Array<{
    role: "user" | "assistant";
    content: {
      type: "text" | "image";
      text?: string;
      data?: string;
      mimeType?: string;
    };
  }>;
}

// JSON-RPC Request
interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: object | any[];
}

// JSON-RPC Response
interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// JSON-RPC Notification
interface JSONRPCNotification {
  jsonrpc: "2.0";
  method: string;
  params?: object | any[];
  // Note: NO id field!
}

// JSON Schema (simplified)
interface JSONSchema {
  type: "object" | "string" | "number" | "boolean" | "array" | "null";
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  description?: string;
}
```

### Server Capability Types

```typescript
interface ServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    listChanged?: boolean;
    subscribe?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  sampling?: {};
}

interface ClientCapabilities {
  sampling?: {};
  roots?: {
    listChanged?: boolean;
  };
}

interface InitializeParams {
  protocolVersion: string;
  clientInfo: {
    name: string;
    version: string;
  };
  capabilities: ClientCapabilities;
}

interface InitializeResult {
  protocolVersion: string;
  serverInfo: {
    name: string;
    version: string;
  };
  capabilities: ServerCapabilities;
}
```

---

## Official Documentation Links

### Primary Documentation
- **MCP Specification (2025-03-26)**: https://modelcontextprotocol.io/specification/2025-03-26
- **MCP GitHub Repository**: https://github.com/modelcontextprotocol/modelcontextprotocol
- **Anthropic MCP Announcement**: https://www.anthropic.com/news/model-context-protocol

### Specific Topics
- **Tools**: https://modelcontextprotocol.io/specification/draft/server/tools
- **Resources**: https://modelcontextprotocol.io/specification/draft/server/resources
- **Prompts**: https://modelcontextprotocol.io/specification/draft/server/prompts
- **JSON-RPC 2.0 Specification**: https://www.jsonrpc.org/specification

### Community Resources
- **MCP Development Guide**: https://github.com/cyanheads/model-context-protocol-resources
- **JSON-RPC in MCP Guide**: https://mcpcat.io/guides/understanding-json-rpc-protocol-mcp/

---

## Quick Reference Checklist

When implementing MCP features, verify:

- [ ] All JSON-RPC messages have `"jsonrpc": "2.0"`
- [ ] Tool names are 1-128 chars, alphanumeric + `_-./`
- [ ] Input schemas are valid JSON Schema
- [ ] Tool execution errors use `isError: true`, not thrown exceptions
- [ ] Protocol errors use standard JSON-RPC error codes
- [ ] Resources have URI templates with `{placeholder}` syntax
- [ ] Prompts return message arrays with role + content
- [ ] Initialize handshake specifies protocol version
- [ ] Bearer tokens used for HTTP transport authentication
- [ ] CORS configured for allowed origins
- [ ] All inputs validated before processing
- [ ] Error messages are descriptive and actionable
- [ ] No secrets hardcoded in source code
- [ ] Timeouts implemented for long-running operations
- [ ] Proper logging for debugging and monitoring
- [ ] Tool descriptions are clear for AI model understanding

---

## Usage Instructions

When invoked, this skill gives you comprehensive MCP protocol knowledge. Use it to:

1. **Implement new tools/resources/prompts** - Follow specification patterns
2. **Debug protocol issues** - Check JSON-RPC message formats
3. **Review code for compliance** - Verify against best practices
4. **Design MCP servers** - Use architecture patterns and security guidelines
5. **Answer MCP questions** - Reference official specifications

**Remember**: Always prioritize security, validate inputs, and maintain clear error messages!

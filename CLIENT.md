# MCP Client Documentation

Complete guide for using the MCP HTTP client to connect to local or remote MCP servers.

## Table of Contents

- [Quick Start](#quick-start)
- [Client Types](#client-types)
- [HTTP Client Usage](#http-client-usage)
- [Configuration](#configuration)
- [Available Commands](#available-commands)
- [Connecting to Remote Servers](#connecting-to-remote-servers)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Local Connection (stdio)

```bash
# Terminal 1: Start stdio server
npm run dev:stdio

# Terminal 2: Start stdio client
npm run dev:client
```

### Local HTTP Connection

```bash
# Terminal 1: Start HTTP server
npm run dev:http

# Terminal 2: Start HTTP client
npm run dev:client-http
```

### Remote Connection

```bash
# Set server URL in .env
MCP_SERVER_URL=https://your-server.com/mcp

# Start client
npm run dev:client-http
```

---

## Client Types

### 1. Stdio Client ([client.ts](client.ts))

**Use case:** Local development, same machine

**Transport:** Standard input/output (pipes)

**Features:**
- Client spawns server as child process
- No network required
- Client provides AI sampling to server

**Pros:**
- Simple setup
- No authentication needed
- Fast (no network latency)

**Cons:**
- Both must run on same machine
- Can't connect to remote servers

### 2. HTTP Client ([client-http.ts](client-http.ts))

**Use case:** Remote connections, Docker, cloud deployments

**Transport:** HTTP/HTTPS over network

**Features:**
- Connects to any HTTP MCP server
- Session management
- API key authentication
- Works across networks

**Pros:**
- Connect to remote servers
- Works with Docker/cloud
- Multiple clients can connect
- Production-ready

**Cons:**
- Requires running server
- Need API key authentication
- Network latency

---

## HTTP Client Usage

### Installation

No additional dependencies needed - uses built-in `fetch`.

### Basic Usage

```bash
# Development mode (with tsx - hot reload)
npm run dev:client-http

# Production mode (from built files)
npm run start:client-http
```

### Interactive CLI

Once started, you'll see:

```
╔════════════════════════════════════════╗
║     MCP HTTP Client                    ║
║     Connect to remote MCP servers      ║
╚════════════════════════════════════════╝

Server: http://localhost:3000/mcp
Auth: Bearer development-key

🔌 Connecting to http://localhost:3000/mcp...
✅ Connected! Server: test-server v0.1.0
📋 Capabilities: tools, resources, prompts, sampling
🔑 Session ID: session_123456789_abc123

Type /help for available commands, or /exit to quit.

mcp>
```

---

## Configuration

### Environment Variables

Create a `.env` file (or edit existing):

```bash
# Server connection
MCP_SERVER_URL=http://localhost:3000/mcp

# Authentication (must match server's API key)
MCP_API_KEY=development-key
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_SERVER_URL` | `http://localhost:3000/mcp` | Full URL to MCP endpoint |
| `MCP_API_KEY` | `development-key` | API key for authentication |

### Example Configurations

**Local server:**
```bash
MCP_SERVER_URL=http://localhost:3000/mcp
MCP_API_KEY=development-key
```

**Docker container:**
```bash
MCP_SERVER_URL=http://mcp-server:3000/mcp
MCP_API_KEY=my-secret-key
```

**Remote server:**
```bash
MCP_SERVER_URL=https://mcp.example.com/mcp
MCP_API_KEY=prod-secret-key-12345
```

---

## Available Commands

### Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/help` | Show available commands | `/help` |
| `/exit` | Exit the client | `/exit` |

### Tool Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/tools` | List all available tools | `/tools` |
| `/add <a> + <b>` | Add two numbers | `/add 10 + 25` |
| `/summary <text>` | Summarize text with AI | `/summary This is a long text...` |

### Resource Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/resources` | List all resources | `/resources` |
| `/read <uri>` | Read a resource | `/read greeting://World` |

### Prompt Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/prompts` | List all prompts | `/prompts` |
| `/greet <name>` | Get greeting prompt | `/greet Alice` |

---

## Connecting to Remote Servers

### Step 1: Start Remote Server

**Option A: Docker**
```bash
# On remote server
docker-compose up -d
```

**Option B: Direct**
```bash
# On remote server
npm run build
npm start
```

### Step 2: Configure Client

```bash
# On your local machine
# Edit .env
MCP_SERVER_URL=https://your-server.com/mcp
MCP_API_KEY=your-secret-key
```

### Step 3: Connect

```bash
npm run dev:client-http
```

### Security Notes

1. **Use HTTPS in production**
   ```bash
   MCP_SERVER_URL=https://your-server.com/mcp  # ✅
   MCP_SERVER_URL=http://your-server.com/mcp   # ❌ Insecure!
   ```

2. **Change default API key**
   ```bash
   MCP_API_KEY=your-unique-secret-key  # ✅
   MCP_API_KEY=development-key         # ❌ Default!
   ```

3. **Don't commit .env to git**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

---

## Examples

### Example 1: Simple Math

```
mcp> /add 5 + 3

✅ Result: 8
```

### Example 2: AI Summarization

```
mcp> /summary The quick brown fox jumps over the lazy dog. This is a classic pangram used in typography.

⏳ Generating summary...

📝 Summary:
A concise explanation of the pangram "The quick brown fox jumps over the lazy dog" and its common use in typography and font testing.
```

### Example 3: Resource Access

```
mcp> /read greeting://Developer

📄 Resource Content:
Hello, Developer!
```

### Example 4: Listing Capabilities

```
mcp> /tools

🔧 Available Tools:

  • add: Add two numbers
  • summarize: Summarize text using AI
```

---

## Session Management

The HTTP client automatically manages sessions:

1. **First request:** Server creates a session
2. **Session ID:** Stored automatically in client
3. **Subsequent requests:** Session ID sent with each request
4. **Session expiry:** 1 hour of inactivity (configurable on server)

You don't need to do anything - it's handled automatically!

---

## Programmatic Usage

You can also use the HTTP client programmatically:

```typescript
import { HttpMcpClient } from "./client-http.js";

const client = new HttpMcpClient(
  "http://localhost:3000/mcp",
  "development-key"
);

// Initialize
await client.initialize();

// List tools
const tools = await client.listTools();
console.log(tools);

// Call a tool
const result = await client.callTool("add", { a: 5, b: 3 });
console.log(result.content[0].text); // "8"

// Read resource
const resource = await client.readResource("greeting://World");
console.log(resource.contents[0].text); // "Hello, World!"
```

---

## Testing

### Manual Testing

```bash
# Terminal 1: Start server
npm run dev:http

# Terminal 2: Start client
npm run dev:client-http

# Terminal 2: Run commands
mcp> /tools
mcp> /add 10 + 20
mcp> /read greeting://Test
```

### Automated Testing

```bash
# Run test suite
npx tsx test-http-client.ts
```

This tests:
- Connection initialization
- Tool listing and execution
- Resource listing and reading
- Prompt listing and retrieval
- Session management

---

## Troubleshooting

### "Failed to connect to server"

**Problem:** Can't reach the server

**Solutions:**
```bash
# Check server is running
curl http://localhost:3000/health

# Check URL is correct
echo $MCP_SERVER_URL

# Check firewall/network
ping your-server.com
```

### "Unauthorized: Invalid API key"

**Problem:** API key doesn't match

**Solutions:**
```bash
# Check API key matches server
# Client .env:
MCP_API_KEY=development-key

# Server must have same key
# Restart server if you changed it
```

### "Request failed: fetch failed"

**Problem:** Network error

**Solutions:**
1. Check internet connection
2. Verify server URL is correct
3. Check if server is accessible:
   ```bash
   curl https://your-server.com/mcp
   ```
4. Check DNS resolution:
   ```bash
   nslookup your-server.com
   ```

### "Session expired"

**Problem:** Session timed out (1 hour idle)

**Solution:** Just reconnect - client will get new session automatically

### Commands not working

**Problem:** Wrong syntax

**Solutions:**
```bash
# Show help
mcp> /help

# Check syntax examples
/add 5 + 3              # ✅
/add 5+3                # ✅
/add five plus three    # ❌

/summary Hello world    # ✅
/summary                # ❌ (no text provided)
```

---

## Comparison: Stdio vs HTTP Client

| Feature | Stdio Client | HTTP Client |
|---------|--------------|-------------|
| **Network** | No | Yes |
| **Remote** | ❌ | ✅ |
| **Docker** | ❌ | ✅ |
| **Auth** | No | API Key |
| **Sessions** | N/A | Yes |
| **Multiple clients** | ❌ | ✅ |
| **Latency** | None | Network |
| **Setup** | Simple | Medium |
| **Use case** | Local dev | Production |

---

## Advanced Usage

### Custom Headers

Modify `client-http.ts` to add custom headers:

```typescript
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${this.apiKey}`,
  "X-Custom-Header": "value", // Add here
};
```

### Timeout Configuration

Add timeout to fetch:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30s

const response = await fetch(this.serverUrl, {
  method: "POST",
  headers,
  body: JSON.stringify(request),
  signal: controller.signal,
});

clearTimeout(timeout);
```

### Retry Logic

```typescript
async function fetchWithRetry(url: string, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Integration Examples

### Node.js Script

```typescript
import { HttpMcpClient } from "./client-http.js";

async function analyzeText(text: string) {
  const client = new HttpMcpClient(
    process.env.MCP_SERVER_URL!,
    process.env.MCP_API_KEY!
  );

  await client.initialize();
  const result = await client.callTool("summarize", { text });
  return result.content[0].text;
}

const summary = await analyzeText("Your long text here...");
console.log(summary);
```

### Web Application

```typescript
// In your web app
const client = new HttpMcpClient(
  "https://api.yourapp.com/mcp",
  userApiKey
);

// On button click
async function handleSummarize() {
  const text = document.getElementById("input").value;
  const summary = await client.callTool("summarize", { text });
  document.getElementById("output").innerText = summary.content[0].text;
}
```

---

## Summary

**Development:**
```bash
npm run dev:client-http     # Local testing
```

**Production:**
```bash
npm run start:client-http   # Built version
```

**Testing:**
```bash
npx tsx test-http-client.ts # Automated tests
```

**Configuration:**
```bash
# .env
MCP_SERVER_URL=http://localhost:3000/mcp
MCP_API_KEY=development-key
```

For more information:
- Server setup: [README.md](README.md)
- Build system: [BUILD.md](BUILD.md)
- Development: [DEVELOPMENT.md](DEVELOPMENT.md)

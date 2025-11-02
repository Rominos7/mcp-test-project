# MCP Server Weather Example

This repository demonstrates a Model Context Protocol (MCP) server and client implementation using Node.js and TypeScript, with support for both **local (stdio)** and **remote (HTTP)** connections.

## Architecture Overview

This project supports two deployment modes:

### 1. Local Mode (stdio transport)
- Server and client run on the same machine
- Communication via stdin/stdout pipes
- Best for: Local development, MCP client applications

### 2. Remote Mode (HTTP transport)
- Server runs as HTTP API (standalone or in Docker)
- Client connects remotely via HTTP/JSON-RPC
- Session management with API key authentication
- Best for: Production deployments, remote access, cloud hosting

## Features

### MCP Protocol Support
- **Tools**: `add` (arithmetic), `summarize` (AI-powered text summarization)
- **Resources**: `greeting` (personalized greetings by name)
- **Prompts**: `helloPrompt` (greeting message templates)
- **Sampling**: Client-provided AI capabilities using Anthropic's Claude API

### Transport & Deployment
- **Stdio Transport**: Local IPC using stdin/stdout
- **HTTP Transport**: RESTful API with JSON-RPC 2.0
- **Docker Support**: Multi-stage builds with docker-compose
- **Remote Access**: Connect from any HTTP client with API key auth

### Developer Experience
- **TypeScript**: Full type safety with strict mode
- **Modular Architecture**: Clean separation in `src/` folder
- **Professional Build System**: Development, production, and Docker builds
- **Comprehensive Documentation**: BUILD.md, CLIENT.md, DEVELOPMENT.md
- **Testing**: Automated test suite for HTTP client

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Anthropic API key (for AI summarization feature)
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mcp-server-weather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API keys:
   ```env
   # Required for AI summarization
   ANTHROPIC_API_KEY=sk-ant-xxxxx

   # Required for HTTP mode only
   MCP_API_KEY=your-secret-api-key-here
   ```

### Quick Start: Local Mode (stdio)

**Start the local server:**
```bash
npm run dev
```

**In another terminal, start the local client:**
```bash
npm run client
```

### Quick Start: HTTP Mode

**Option 1: Run locally**
```bash
npm run dev:http
```

**Option 2: Run with Docker**
```bash
docker-compose up --build
```

**Connect with HTTP client:**
```bash
npm run test:http
```

Or use the interactive HTTP client:
```bash
npm run client:http
```


#### Example Commands (in client)
- `/greet Alice` — Get a greeting for Alice using the MCP prompt
- `/add 5 + 7` — Add two integer numbers using the MCP tool
- `/summary <text>` — Summarize text using AI (Claude Sonnet 4.0)
- `/help` — List available commands
- `/exit` — Quit the client

The client is interactive. After starting, type commands at the prompt (`>`):

```
> /greet Alice
Hello, Alice!
> /add 5 + 7
Result -> 12
> /summary The quick brown fox jumps over the lazy dog. This is a pangram sentence.
Summary -> A brief sentence demonstrating a pangram - a phrase containing all letters of the alphabet.
> /help
Command list
/greet - use MCP prompt to greet yourself
/add - add two integer numbers
/summary - summarize text using AI
/exit - to terminate work of the client
> /exit
```
#### Example Screenshots (in client)

<img width="500" height="179" alt="Screenshot 2025-10-01 052252" src="https://github.com/user-attachments/assets/33a76741-1710-471e-aa7f-0f538055c359" />
<img width="891" height="85" alt="Screenshot 2025-10-01 052640" src="https://github.com/user-attachments/assets/67abc1c3-5a87-4dde-a470-e1a1776d635d" />
<img width="128" height="53" alt="Screenshot 2025-10-01 052713" src="https://github.com/user-attachments/assets/7f4373b1-6b4e-47ec-9a98-99dc325c4c46" />
<img width="131" height="57" alt="Screenshot 2025-10-01 052912" src="https://github.com/user-attachments/assets/63a63a2e-0a7e-46e8-9616-21aaf4439374" />


## Project Structure

```
mcp-server-weather/
├── src/                          # Source code (HTTP mode)
│   ├── config/                   # Environment configuration
│   ├── http/                     # HTTP server implementation
│   │   ├── handlers/             # JSON-RPC request handlers
│   │   ├── middleware/           # Express middleware (auth, cors, security)
│   │   ├── routes/               # API routes (health, mcp)
│   │   ├── utils/                # Session management
│   │   └── server.ts             # HTTP server setup
│   └── mcp/                      # MCP protocol definitions (modular)
│       ├── tools/                # Tool definitions (add, summarize)
│       ├── resources/            # Resource definitions (greeting)
│       └── prompts/              # Prompt definitions (hello)
├── scripts/                      # Build verification scripts
├── server.ts                     # MCP server (stdio mode)
├── server-core.ts                # Core MCP logic (shared)
├── server-http.ts                # HTTP server entry point
├── client.ts                     # MCP client (stdio mode)
├── client-http.ts                # HTTP client implementation
├── test-http-client.ts           # HTTP client automated tests
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker orchestration
├── .env.example                  # Environment variables template
├── BUILD.md                      # Build system documentation
├── CLIENT.md                     # HTTP client usage guide
├── DEVELOPMENT.md                # Developer documentation
└── package.json                  # Dependencies and npm scripts
```

## MCP Server Capabilities
- **Tools**
  - `add`: Adds two numbers
  - `summarize`: Summarizes text using AI (demonstrates MCP sampling/createMessage)
- **Resources**
  - `greeting`: Returns a greeting for a given name
- **Prompts**
  - `helloPrompt`: Returns a greeting message for a given name

## MCP Client Features
- **Sampling Handler**: Implements `sampling/createMessage` to provide AI capabilities to the server
- **AI Model**: Uses Anthropic's Claude Sonnet 4.0 via the Anthropic SDK
- **MCP Concept**: Demonstrates the MCP pattern where the client provides LLM access to the server

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. **Build the image:**
   ```bash
   docker build -t mcp-server-weather .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e ANTHROPIC_API_KEY=your-key \
     -e MCP_API_KEY=your-api-key \
     mcp-server-weather
   ```

### Environment Variables for Production

Set these in your `.env` file or pass them to Docker:

```env
# Required: Anthropic API key for AI features
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Required: Authentication key for HTTP endpoints
MCP_API_KEY=your-secure-random-key

# Optional: Server configuration
MCP_SERVER_HOST=0.0.0.0
MCP_SERVER_PORT=3000
NODE_ENV=production
```

**Important for Production:**
- Generate a strong random key for `MCP_API_KEY` (e.g., using `openssl rand -base64 32`)
- Never commit your `.env` file with real keys
- Use secrets management in production (Docker secrets, Kubernetes secrets, etc.)

## HTTP Client Usage

### Connecting to Remote Server

The HTTP client can connect to any MCP server running in HTTP mode:

```typescript
import { HttpMcpClient } from "./client-http.js";

const client = new HttpMcpClient({
  serverUrl: "http://localhost:3000",
  apiKey: process.env.MCP_API_KEY!,
});

await client.initialize();
const tools = await client.listTools();
const result = await client.callTool("add", { a: 5, b: 7 });
```

### Remote Connection Examples

**Local server:**
```bash
MCP_SERVER_URL=http://localhost:3000 npm run client:http
```

**Remote server:**
```bash
MCP_SERVER_URL=https://your-domain.com npm run client:http
```

**With custom API key:**
```bash
MCP_API_KEY=your-key MCP_SERVER_URL=http://localhost:3000 npm run client:http
```

### Automated Testing

Run the full test suite against your HTTP server:

```bash
npm run test:http
```

This runs 7 automated tests covering:
- Server health check
- Session initialization
- Tool listing and execution
- Resource reading
- Prompt retrieval

## How MCP Sampling Works

This project demonstrates MCP's **sampling** feature:
1. Server registers a tool (`summarize`) that needs AI capabilities
2. Server calls `createMessage()` to request AI completion from the client
3. Client receives the request via its sampling handler
4. Client invokes Claude API and returns the response to the server
5. Server returns the AI-generated summary to the client

This architecture allows servers to leverage AI without directly accessing LLM APIs.

## Documentation

- **[BUILD.md](BUILD.md)** - Complete build system documentation
- **[CLIENT.md](CLIENT.md)** - HTTP client usage and API reference
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer guide and best practices

## Claude Code Skills

This repository includes comprehensive **Claude Code skills** located in [`.claude/skills/`](.claude/skills/) to assist with development:

### Available Skills

1. **[mcp-protocol](.claude/skills/mcp-protocol/SKILL.md)** - MCP Protocol Expert
   - Complete MCP specification knowledge (2025-03-26)
   - JSON-RPC 2.0 protocol patterns
   - Tools, resources, prompts implementation
   - Transport layers (stdio, HTTP, SSE)
   - Security and best practices

2. **[mcp-project-patterns](.claude/skills/mcp-project-patterns/SKILL.md)** - Project-Specific Patterns
   - Step-by-step guides for adding MCP features
   - File structure conventions
   - Zod validation patterns
   - Integration examples

3. **[nodejs](.claude/skills/nodejs/SKILL.md)** - Node.js Expert (2025)
   - TypeScript integration and strict mode
   - Express.js patterns and middleware
   - Async programming and worker threads
   - JWT/OAuth/2FA authentication
   - Security best practices
   - Modern DevOps & CI/CD (Husky, GitHub Actions)
   - Message queues (BullMQ)
   - Performance optimization

4. **[docker](.claude/skills/docker/SKILL.md)** - Docker Expert (2025)
   - Multi-stage builds and optimization
   - Layer caching and BuildKit features
   - Container security (rootless, scanning)
   - Docker Compose orchestration
   - Production deployment patterns
   - Networking and volumes

5. **[typescript](.claude/skills/typescript/SKILL.md)** - TypeScript Expert (5.x)
   - Advanced type system mastery
   - Generics and utility types
   - Discriminated unions and type guards
   - Conditional and mapped types
   - Template literal types
   - Decorators and metadata
   - Strict mode configuration
   - Performance optimization

### How Skills Work

When using Claude Code, these skills automatically activate when you ask questions related to:
- MCP protocol and implementation
- Node.js and TypeScript development
- Docker containerization and deployment
- Type system design and advanced patterns

The skills provide context-aware assistance, ensuring consistent patterns and best practices throughout the codebase.

### Skill Benefits

- ✅ **Consistent Patterns** - Enforces project conventions
- ✅ **Best Practices** - 2025 industry standards
- ✅ **Security Focus** - Built-in security considerations
- ✅ **Type Safety** - Strict TypeScript patterns
- ✅ **Production Ready** - Deployment and optimization guidance
- ✅ **Self-Documenting** - Skills serve as living documentation

## License
MIT

## Author
Roman Serhiichuk

/**
 * MCP HTTP Client
 *
 * Connects to an MCP server over HTTP (instead of stdio).
 * Can connect to remote servers or local Docker containers.
 */

import readline from "readline";
import "dotenv/config";

// Configuration from environment variables
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000/mcp";
const MCP_API_KEY = process.env.MCP_API_KEY || "development-key";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: any;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * HTTP MCP Client class
 */
class HttpMcpClient {
  private serverUrl: string;
  private apiKey: string;
  private sessionId?: string;
  private requestId = 0;

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
  }

  /**
   * Send a JSON-RPC request to the server
   */
  private async sendRequest(method: string, params?: any): Promise<any> {
    this.requestId++;

    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: this.requestId,
      method,
      params: params || {},
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apiKey}`,
      "Accept": "application/json",
    };

    // Include session ID if we have one
    if (this.sessionId) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }

    try {
      const response = await fetch(this.serverUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      // Extract session ID from response if present
      const newSessionId = response.headers.get("Mcp-Session-Id");
      if (newSessionId) {
        this.sessionId = newSessionId;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: JsonRpcResponse = await response.json();

      if (data.error) {
        throw new Error(`JSON-RPC Error: ${data.error.message} (code: ${data.error.code})`);
      }

      return data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Initialize connection to server
   */
  async initialize(): Promise<void> {
    console.log(`🔌 Connecting to ${this.serverUrl}...`);

    const result = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        sampling: {},
      },
      clientInfo: {
        name: "http-client",
        version: "1.0.0",
      },
    });

    console.log(`✅ Connected! Server: ${result.serverInfo.name} v${result.serverInfo.version}`);
    console.log(`📋 Capabilities:`, Object.keys(result.capabilities).join(", "));

    if (this.sessionId) {
      console.log(`🔑 Session ID: ${this.sessionId}`);
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    const result = await this.sendRequest("tools/list");
    return result.tools;
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: any): Promise<any> {
    const result = await this.sendRequest("tools/call", {
      name,
      arguments: args,
    });
    return result;
  }

  /**
   * List available resources
   */
  async listResources(): Promise<any[]> {
    const result = await this.sendRequest("resources/list");
    return result.resources;
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    const result = await this.sendRequest("resources/read", { uri });
    return result;
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<any[]> {
    const result = await this.sendRequest("prompts/list");
    return result.prompts;
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args: any): Promise<any> {
    const result = await this.sendRequest("prompts/get", {
      name,
      arguments: args,
    });
    return result;
  }
}

/**
 * Main CLI interface
 */
async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     MCP HTTP Client                    ║");
  console.log("║     Connect to remote MCP servers      ║");
  console.log("╚════════════════════════════════════════╝");
  console.log();
  console.log(`Server: ${MCP_SERVER_URL}`);
  console.log(`Auth: Bearer ${MCP_API_KEY === "development-key" ? "development-key" : "***"}`);
  console.log();

  // Create client
  const client = new HttpMcpClient(MCP_SERVER_URL, MCP_API_KEY);

  try {
    // Initialize connection
    await client.initialize();
  } catch (error) {
    console.error(`\n❌ Failed to connect to server:`);
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error(`\nPlease check:`);
    console.error(`   1. Server is running: ${MCP_SERVER_URL}`);
    console.error(`   2. API key is correct: ${MCP_API_KEY === "development-key" ? "Using default key" : "Using custom key"}`);
    console.error(`   3. Network connection is working`);
    process.exit(1);
  }

  // Create CLI interface
  const cli = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "mcp> ",
  });

  console.log();
  console.log("Type /help for available commands, or /exit to quit.");
  console.log();
  cli.prompt();

  cli.on("line", async (line) => {
    const input = line.trim();

    try {
      // Exit command
      if (input === "/exit" || input === "/quit") {
        console.log("👋 Goodbye!");
        cli.close();
        process.exit(0);
      }

      // Help command
      if (input.startsWith("/help")) {
        console.log("\n📚 Available Commands:\n");
        console.log("  /help                    - Show this help message");
        console.log("  /tools                   - List available tools");
        console.log("  /add <a> + <b>           - Add two numbers");
        console.log("  /summary <text>          - Summarize text using AI");
        console.log("  /resources               - List available resources");
        console.log("  /read <uri>              - Read a resource");
        console.log("  /prompts                 - List available prompts");
        console.log("  /greet <name>            - Get greeting prompt");
        console.log("  /exit                    - Exit the client");
        console.log();
        cli.prompt();
        return;
      }

      // List tools
      if (input === "/tools") {
        const tools = await client.listTools();
        console.log("\n🔧 Available Tools:\n");
        tools.forEach((tool) => {
          console.log(`  • ${tool.name}: ${tool.description}`);
        });
        console.log();
        cli.prompt();
        return;
      }

      // Add tool
      if (input.startsWith("/add")) {
        const mathString = input.slice(4).trim();
        const match = mathString.match(/^(\d+)\s*\+\s*(\d+)$/);

        if (!match) {
          console.log("❌ Usage: /add <number> + <number>");
          console.log("   Example: /add 5 + 3");
          cli.prompt();
          return;
        }

        const a = Number(match[1]);
        const b = Number(match[2]);

        const result = await client.callTool("add", { a, b });
        console.log(`\n✅ Result: ${result.content[0]?.text}\n`);
        cli.prompt();
        return;
      }

      // Summary tool
      if (input.startsWith("/summary")) {
        const text = input.slice(8).trim();

        if (!text) {
          console.log("❌ Usage: /summary <text>");
          console.log("   Example: /summary This is a long text that needs summarization");
          cli.prompt();
          return;
        }

        console.log("⏳ Generating summary...");
        const result = await client.callTool("summarize", { text });
        console.log(`\n📝 Summary:\n${result.content[0]?.text}\n`);
        cli.prompt();
        return;
      }

      // List resources
      if (input === "/resources") {
        const resources = await client.listResources();
        console.log("\n📦 Available Resources:\n");
        resources.forEach((resource) => {
          console.log(`  • ${resource.name}: ${resource.description}`);
          console.log(`    URI: ${resource.uri}`);
        });
        console.log();
        cli.prompt();
        return;
      }

      // Read resource
      if (input.startsWith("/read")) {
        const uri = input.slice(5).trim();

        if (!uri) {
          console.log("❌ Usage: /read <uri>");
          console.log("   Example: /read greeting://World");
          cli.prompt();
          return;
        }

        const result = await client.readResource(uri);
        console.log(`\n📄 Resource Content:\n${result.contents[0]?.text}\n`);
        cli.prompt();
        return;
      }

      // List prompts
      if (input === "/prompts") {
        const prompts = await client.listPrompts();
        console.log("\n💬 Available Prompts:\n");
        prompts.forEach((prompt) => {
          console.log(`  • ${prompt.name}: ${prompt.description}`);
        });
        console.log();
        cli.prompt();
        return;
      }

      // Get prompt (greet)
      if (input.startsWith("/greet")) {
        const name = input.slice(6).trim();

        if (!name) {
          console.log("❌ Usage: /greet <name>");
          console.log("   Example: /greet Alice");
          cli.prompt();
          return;
        }

        const result = await client.getPrompt("helloPrompt", { name });
        console.log(`\n👋 ${result.messages[0]?.content.text}\n`);
        cli.prompt();
        return;
      }

      // Unknown command
      console.log(`❌ Unknown command: ${input}`);
      console.log("   Type /help for available commands");
      cli.prompt();
    } catch (error) {
      console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
      cli.prompt();
    }
  });

  cli.on("close", () => {
    console.log("\n👋 Goodbye!");
    process.exit(0);
  });
}

// Start the client
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

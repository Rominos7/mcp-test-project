import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server-core.js";

// Create MCP server with shared logic
const server = createMcpServer();

// Connect using stdio transport for local communication
const transport = new StdioServerTransport();
await server.connect(transport);

import express from "express";
import type { Request, Response } from "express";
import { sessionManager } from "../utils/session.manager.js";
import { handleToolsList, handleToolsCall } from "../handlers/tools.handler.js";
import { handleResourcesList, handleResourcesRead } from "../handlers/resources.handler.js";
import { handlePromptsList, handlePromptsGet } from "../handlers/prompts.handler.js";

const router = express.Router();

/**
 * Main MCP endpoint - POST for client messages
 */
router.post("/mcp", async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const session = sessionManager.getOrCreateSession(sessionId);

    // Set session header in response
    res.setHeader("Mcp-Session-Id", session.id);

    const jsonRpcMessage = req.body;

    // Validate JSON-RPC format
    if (!jsonRpcMessage || typeof jsonRpcMessage !== "object") {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request: Body must be a JSON-RPC message",
        },
        id: null,
      });
    }

    const { jsonrpc, method, params, id } = jsonRpcMessage;

    if (jsonrpc !== "2.0") {
      return res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request: jsonrpc must be '2.0'",
        },
        id: id || null,
      });
    }

    // Route to appropriate handler based on method
    let result;

    switch (method) {
      case "initialize":
        result = await handleInitialize(params);
        break;

      case "tools/list":
        result = await handleToolsList();
        break;

      case "tools/call":
        result = await handleToolsCall(params);
        break;

      case "resources/list":
        result = await handleResourcesList();
        break;

      case "resources/read":
        result = await handleResourcesRead(params);
        break;

      case "prompts/list":
        result = await handlePromptsList();
        break;

      case "prompts/get":
        result = await handlePromptsGet(params);
        break;

      default:
        return res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
          id: id || null,
        });
    }

    // Send JSON response
    res.setHeader("Content-Type", "application/json");
    res.json({
      jsonrpc: "2.0",
      result,
      id: id || null,
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error",
        data: error instanceof Error ? error.message : String(error),
      },
      id: req.body?.id || null,
    });
  }
});

/**
 * SSE endpoint (optional) - GET /mcp
 * Currently not implemented
 */
router.get("/mcp", (req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "SSE not implemented. Use POST for all requests.",
    },
    id: null,
  });
});

/**
 * Handle initialize method
 */
async function handleInitialize(params: any) {
  return {
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
      sampling: {},
    },
    serverInfo: {
      name: "test-server",
      version: "0.1.0",
    },
  };
}

export default router;

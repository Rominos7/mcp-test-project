import Anthropic from "@anthropic-ai/sdk";
import { config } from "../../config/env.config.js";
import {
  TOOL_DEFINITIONS,
  executeAddTool,
  executeSummarizeTool,
} from "../../../server-core.js";

const anthropic = config.anthropicApiKey
  ? new Anthropic({ apiKey: config.anthropicApiKey })
  : null;

/**
 * List all available tools
 * Uses definitions from server-core (single source of truth)
 */
export async function handleToolsList() {
  return {
    tools: Object.values(TOOL_DEFINITIONS),
  };
}

/**
 * Execute a tool
 * Delegates to server-core functions (single source of truth)
 */
export async function handleToolsCall(params: any) {
  const { name, arguments: args } = params;

  // Route to appropriate tool handler from server-core
  switch (name) {
    case "add":
      return executeAddTool(args);

    case "summarize":
      return executeSummarizeTool(args, anthropic || undefined);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

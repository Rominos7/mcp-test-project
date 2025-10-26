/**
 * Tools Index
 *
 * Central export point for all MCP tools.
 * Import from here to get access to all tools.
 */

import addTool, { addToolDefinition, executeAddTool } from "./add.tool.js";
import summarizeTool, { summarizeToolDefinition, executeSummarizeTool } from "./summarize.tool.js";

// Export individual tools
export { addTool, summarizeTool };

// Export definitions
export { addToolDefinition, summarizeToolDefinition };

// Export executors
export { executeAddTool, executeSummarizeTool };

// Export all definitions as a collection
export const TOOL_DEFINITIONS = {
  add: addToolDefinition,
  summarize: summarizeToolDefinition,
} as const;

// Export all executors as a collection
export const TOOL_EXECUTORS = {
  add: executeAddTool,
  summarize: executeSummarizeTool,
} as const;

// Export all tools (definitions + executors)
export const ALL_TOOLS = {
  add: addTool,
  summarize: summarizeTool,
} as const;

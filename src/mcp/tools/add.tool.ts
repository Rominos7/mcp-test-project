/**
 * Add Tool
 *
 * Simple arithmetic tool that adds two numbers together.
 */

// Tool Definition (metadata)
export const addToolDefinition = {
  name: "add",
  title: "Addition Tool",
  description: "Add two numbers",
  inputSchema: {
    type: "object" as const,
    properties: {
      a: { type: "number" as const },
      b: { type: "number" as const },
    },
    required: ["a", "b"],
  },
} as const;

// Tool Handler (implementation)
export async function executeAddTool(args: { a: number; b: number }) {
  const { a, b } = args;

  return {
    content: [
      {
        type: "text" as const,
        text: String(a + b),
      },
    ],
  };
}

// Export both for convenience
export default {
  definition: addToolDefinition,
  execute: executeAddTool,
};

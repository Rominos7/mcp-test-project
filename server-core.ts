import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Tool Definitions and Metadata (Single Source of Truth)
// ============================================================================

export const TOOL_DEFINITIONS = {
  add: {
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
  },
  summarize: {
    name: "summarize",
    title: "Text summary",
    description: "Summarize text using AI",
    inputSchema: {
      type: "object" as const,
      properties: {
        text: { type: "string" as const },
      },
      required: ["text"],
    },
  },
} as const;

export const RESOURCE_DEFINITIONS = {
  greeting: {
    name: "greeting",
    title: "Greeting Resource",
    description: "Dynamic greeting generator",
    uriTemplate: "greeting://{name}",
    mimeType: "text/plain",
  },
} as const;

export const PROMPT_DEFINITIONS = {
  helloPrompt: {
    name: "helloPrompt",
    title: "Hello Prompt",
    description: "Returns a greeting for the provided name",
    arguments: [
      {
        name: "name",
        description: "Name to greet",
        required: true,
      },
    ],
  },
} as const;

// ============================================================================
// Tool Handler Functions (Single Source of Truth)
// ============================================================================

/**
 * Add tool - adds two numbers
 */
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

/**
 * Summarize tool - uses AI to summarize text
 * Can work with either client-provided sampling or direct API access
 */
export async function executeSummarizeTool(
  args: { text: string },
  anthropicClient?: Anthropic
) {
  const { text } = args;

  if (!anthropicClient) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Error: AI summarization not available (ANTHROPIC_API_KEY not set)",
        },
      ],
    };
  }

  try {
    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-0",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Provide a summary for this text:\n\n${text}`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");

    return {
      content: [
        {
          type: "text" as const,
          text:
            textContent && textContent.type === "text"
              ? textContent.text
              : "Unable to generate response",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

// ============================================================================
// Resource Handler Functions (Single Source of Truth)
// ============================================================================

/**
 * Read greeting resource
 */
export async function readGreetingResource(uri: string, name: string) {
  return {
    contents: [
      {
        uri,
        mimeType: "text/plain",
        text: `Hello, ${name}!`,
      },
    ],
  };
}

// ============================================================================
// Prompt Handler Functions (Single Source of Truth)
// ============================================================================

/**
 * Get hello prompt
 */
export async function getHelloPrompt(name: string) {
  return {
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Hello, ${name}!`,
        },
      },
    ],
  };
}

// ============================================================================
// MCP Server Creation (for stdio transport)
// ============================================================================

/**
 * Creates and configures an MCP server with all tools, resources, and prompts.
 * This shared logic can be used by both stdio and HTTP transports.
 */
export function createMcpServer(enableSampling: boolean = false): McpServer {
  const server = new McpServer(
    {
      name: "test-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {
          summarize: {
            title: "Text summary",
            description: "Summarize text using AI",
            inputSchema: {
              text: "string",
            },
          },
          add: {
            title: "Addition Tool",
            description: "Add two numbers",
            inputSchema: {
              a: "number",
              b: "number",
            },
          },
        },
        resources: {
          greeting: {
            title: "Greeting Resource",
            description: "Dynamic greeting generator",
            uriTemplate: "greeting://{name}",
          },
        },
        prompts: {
          helloPrompt: {
            title: "Hello Prompt",
            description: "Returns a greeting for the provided name",
            argsSchema: {
              name: "string",
            },
          },
        },
        ...(enableSampling ? { sampling: {} } : {}),
      },
    }
  );

  // Register the addition tool
  server.registerTool(
    "add",
    {
      title: "Addition Tool",
      description: "Add two numbers",
      inputSchema: {
        a: z.number(),
        b: z.number(),
      },
    },
    async ({ a, b }) => executeAddTool({ a, b })
  );

  // Register the summarize tool (requires sampling capability from client)
  server.registerTool(
    "summarize",
    {
      title: "Text summary",
      description: "Summarize text using AI",
      inputSchema: {
        text: z.string(),
      },
    },
    async ({ text }) => {
      const response = await server.server.createMessage({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Provide a summary for this text:\n\n${text}`,
            },
          },
        ],
        maxTokens: 500,
      });

      return {
        content: [
          {
            type: "text",
            text:
              response.content.type === "text"
                ? response.content.text
                : "Unable to generate response",
          },
        ],
      };
    }
  );

  // Register the greeting resource
  server.registerResource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    {
      title: "Greeting Resource",
      description: "Dynamic greeting generator",
    },
    async (uri, { name }) => readGreetingResource(uri.href, String(name))
  );

  // Register the hello prompt
  server.registerPrompt(
    "helloPrompt",
    {
      title: "Hello Prompt",
      description: "Return a greeting for provided name",
      argsSchema: {
        name: z.string(),
      },
    },
    async ({ name }) => getHelloPrompt(name)
  );

  return server;
}

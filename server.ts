import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
    },
  }
);

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
  async ({ a, b }) => ({
    content: [
      {
        type: "text",
        text: String(a + b),
      },
    ],
  })
);

server.registerTool(
  "summarize",
  {
    title: "Text summary",
    description: "Summarize text using AI",
    inputSchema: {
      text: z.string()
    }
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

server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  {
    title: "Greeting Resource",
    description: "Dynamic greeting generator",
  },
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

server.registerPrompt(
  "helloPrompt",
  {
    title: "Hello Prompt",
    description: "Return a greeting for provided name",
    argsSchema: {
      name: z.string(),
    },
  },
  async ({ name }) => ({
    messages: [
      {
        role: "user", // or "assistant" as appropriate
        content: {
          type: "text",
          text: `Hello, ${name}!`,
        },
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);

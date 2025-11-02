# MCP Project Patterns Skill

This skill contains **project-specific MCP implementation patterns** from the `mcp-server-weather` codebase. Use these real-world examples as templates when adding new tools, resources, or prompts to this project.

---

## 📋 Project Context

**Project**: MCP Server Weather
**Tech Stack**: TypeScript, Node.js, Express, @modelcontextprotocol/sdk
**Architecture**: Dual transport (stdio + HTTP)
**Validation**: Zod for runtime type checking

---

## Code Patterns from This Codebase

### Pattern 1: Tool Definition (Modular Approach)

**File**: [src/mcp/tools/add.tool.ts](src/mcp/tools/add.tool.ts)

```typescript
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
```

**Key Insights:**
- ✅ Separation of definition and implementation
- ✅ `as const` for type inference and immutability
- ✅ Clean, testable function structure
- ✅ Default export combines both for easy importing

**When to Use:**
Use this pattern for simple, synchronous tools that don't require external dependencies.

---

### Pattern 2: AI-Powered Tool (External API)

**File**: [src/mcp/tools/summarize.tool.ts](src/mcp/tools/summarize.tool.ts)

```typescript
export async function executeSummarizeTool(
  args: { text: string },
  anthropicClient?: Anthropic
) {
  const { text } = args;

  // Graceful degradation when API key missing
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
    // Return error as tool execution error (not protocol error)
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
```

**Key Insights:**
- ✅ Graceful error handling with try/catch
- ✅ Optional dependencies (anthropicClient) with fallback
- ✅ External API calls wrapped in error handling
- ✅ Errors returned as content with `isError: true`, not thrown
- ✅ Proper type narrowing for API responses

**When to Use:**
Use this pattern for tools that integrate with external APIs (Anthropic, OpenAI, weather APIs, databases).

---

### Pattern 3: Resource with URI Template

**File**: [src/mcp/resources/greeting.resource.ts](src/mcp/resources/greeting.resource.ts)

```typescript
export const greetingResourceDefinition = {
  name: "greeting",
  title: "Greeting Resource",
  description: "Dynamic greeting generator",
  uriTemplate: "greeting://{name}",
  mimeType: "text/plain",
} as const;

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

export default {
  definition: greetingResourceDefinition,
  read: readGreetingResource,
};
```

**Key Insights:**
- ✅ URI template pattern with placeholders `{name}`
- ✅ MIME type specification for content type
- ✅ URI echoed back in response for client verification
- ✅ Separation of definition and read handler

**When to Use:**
Use this pattern for dynamic resources where the URI contains variable parameters (user profiles, file paths, database records).

---

### Pattern 4: Prompt with Arguments

**File**: [src/mcp/prompts/hello.prompt.ts](src/mcp/prompts/hello.prompt.ts)

```typescript
export const helloPromptDefinition = {
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
} as const;

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

export default {
  definition: helloPromptDefinition,
  get: getHelloPrompt,
};
```

**Key Insights:**
- ✅ Message format compatible with Claude API
- ✅ Role specification (`user` | `assistant`)
- ✅ Content block structure with type
- ✅ Required vs optional arguments
- ✅ Returns message array ready for LLM consumption

**When to Use:**
Use this pattern for templated prompts that users can invoke (code review templates, analysis prompts, formatting guides).

---

### Pattern 5: Single Source of Truth (server-core.ts)

**File**: [server-core.ts](server-core.ts)

```typescript
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

  // Register tools using Zod for validation
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

  server.registerResource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    {
      title: "Greeting Resource",
      description: "Dynamic greeting generator",
    },
    async (uri, { name }) => readGreetingResource(uri.href, String(name))
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
    async ({ name }) => getHelloPrompt(name)
  );

  return server;
}
```

**Key Insights:**
- ✅ Single source of truth prevents drift between stdio and HTTP
- ✅ Both transports use the same handler functions
- ✅ Zod for runtime validation in `registerTool`
- ✅ Type-safe registration with TypeScript
- ✅ Centralized definitions make updates easier
- ✅ Clear separation: definitions → handlers → registration

**When to Use:**
ALWAYS use this pattern. It's the architectural foundation of this project.

---

## Project File Structure

```
src/
├── mcp/                          # Modular MCP components
│   ├── tools/
│   │   ├── add.tool.ts          # Pattern 1: Simple tool
│   │   ├── summarize.tool.ts    # Pattern 2: External API tool
│   │   └── index.ts             # Export barrel
│   ├── resources/
│   │   ├── greeting.resource.ts # Pattern 3: Dynamic resource
│   │   └── index.ts
│   └── prompts/
│       ├── hello.prompt.ts      # Pattern 4: Templated prompt
│       └── index.ts
│
├── http/                         # HTTP transport implementation
│   ├── handlers/
│   │   ├── tools.handler.ts     # Delegates to server-core
│   │   ├── resources.handler.ts
│   │   └── prompts.handler.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── security.middleware.ts
│   └── routes/
│       └── mcp.routes.ts
│
└── config/
    └── env.config.ts             # Environment configuration

server-core.ts                    # Pattern 5: Single source of truth
server.ts                         # Stdio server entry point
server-http.ts                    # HTTP server entry point
```

---

## Adding New Features

### Adding a New Tool

1. **Create tool file** in `src/mcp/tools/myTool.tool.ts`
2. **Follow Pattern 1 or 2** (simple vs external API)
3. **Export in** `src/mcp/tools/index.ts`
4. **Add to** `server-core.ts`:
   - Add definition to `TOOL_DEFINITIONS`
   - Add handler function `executeMyTool`
   - Register in `createMcpServer` using Zod
5. **Update HTTP handler** in `src/http/handlers/tools.handler.ts`
6. **Test** with both stdio and HTTP clients

### Adding a New Resource

1. **Create resource file** in `src/mcp/resources/myResource.resource.ts`
2. **Follow Pattern 3** (URI template)
3. **Export in** `src/mcp/resources/index.ts`
4. **Add to** `server-core.ts`:
   - Add definition to `RESOURCE_DEFINITIONS`
   - Add handler function `readMyResource`
   - Register in `createMcpServer`
5. **Update HTTP handler** in `src/http/handlers/resources.handler.ts`

### Adding a New Prompt

1. **Create prompt file** in `src/mcp/prompts/myPrompt.prompt.ts`
2. **Follow Pattern 4** (argument-based template)
3. **Export in** `src/mcp/prompts/index.ts`
4. **Add to** `server-core.ts`:
   - Add definition to `PROMPT_DEFINITIONS`
   - Add handler function `getMyPrompt`
   - Register in `createMcpServer` with Zod
5. **Update HTTP handler** in `src/http/handlers/prompts.handler.ts`

---

## Project-Specific Best Practices

### 1. Always Use `as const`

```typescript
// ✅ Good: Type inference and immutability
export const toolDef = {
  name: "example",
  inputSchema: {
    type: "object" as const,
    properties: {
      id: { type: "number" as const },
    },
  },
} as const;
```

### 2. Separate Definition from Implementation

```typescript
// ✅ Good: Modular and testable
export const myToolDefinition = { /* ... */ };
export async function executeMyTool(args) { /* ... */ }
export default { definition: myToolDefinition, execute: executeMyTool };
```

### 3. Use Zod for Runtime Validation

```typescript
// ✅ Good: Runtime type safety
server.registerTool(
  "example",
  {
    title: "Example Tool",
    description: "Does something useful",
    inputSchema: {
      email: z.string().email(),
      age: z.number().min(0).max(150),
    },
  },
  async (args) => {
    // args are validated before reaching here
  }
);
```

### 4. Maintain Single Source of Truth

```typescript
// ✅ Good: Define once in server-core.ts
export const TOOL_DEFINITIONS = { /* ... */ };

// ❌ Bad: Duplicating definitions in multiple files
```

### 5. Graceful Degradation for Optional Dependencies

```typescript
// ✅ Good: Check for optional clients
if (!anthropicClient) {
  return {
    content: [{ type: "text", text: "Feature not available" }],
  };
}
```

### 6. Return Errors as Content, Not Exceptions

```typescript
// ✅ Good: MCP-compliant error handling
try {
  const result = await externalAPI.call();
  return { content: [{ type: "text", text: result }] };
} catch (error) {
  return {
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true  // Signal error to client
  };
}

// ❌ Bad: Throwing exceptions
throw new Error("Something went wrong");
```

---

## Common Patterns Summary

| Pattern | Use Case | Example File |
|---------|----------|--------------|
| **Simple Tool** | Synchronous operations, no external deps | `add.tool.ts` |
| **External API Tool** | Async operations, API calls | `summarize.tool.ts` |
| **Dynamic Resource** | URI-based data access | `greeting.resource.ts` |
| **Templated Prompt** | Reusable message templates | `hello.prompt.ts` |
| **Single Source of Truth** | Centralized definitions | `server-core.ts` |

---

## Quick Checklist for New Features

When adding a new tool/resource/prompt:

- [ ] Created file in appropriate `src/mcp/` subdirectory
- [ ] Followed existing pattern (1-4)
- [ ] Used `as const` for type safety
- [ ] Exported in `index.ts` barrel file
- [ ] Added definition to `server-core.ts` DEFINITIONS
- [ ] Added handler function to `server-core.ts`
- [ ] Registered in `createMcpServer` with Zod validation
- [ ] Updated HTTP handler in `src/http/handlers/`
- [ ] Tested with both stdio and HTTP clients
- [ ] Error handling returns content, not thrown exceptions
- [ ] Documentation updated (if needed)

---

## Usage Instructions

When invoked, this skill provides project-specific implementation patterns. Use it to:

1. **Add new MCP features** - Copy existing patterns and adapt
2. **Maintain consistency** - Follow established architectural patterns
3. **Understand the codebase** - See how tools/resources/prompts are structured
4. **Avoid common mistakes** - Learn from working examples

**Remember**: This skill documents the *current* implementation. As the project evolves, update these patterns to reflect best practices.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CreateMessageRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import readline from "readline";
import Anthropic from "@anthropic-ai/sdk";

import "dotenv/config";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.ts"]
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0",
  },
  {
    capabilities: {
      sampling: {},
    },
  }
);

// Set up sampling handler using Claude to provide LLM capabilities to the server
client.setRequestHandler(CreateMessageRequestSchema, async (request) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-0",
    max_tokens: request.params.maxTokens,
    messages: request.params.messages.map((msg) => ({
      role: msg.role,
      content: msg.content.type === "text" ? msg.content.text : "",
    })),
  });

  const textContent = response.content.find((block) => block.type === "text");

  return {
    model: "claude-sonnet-4-0",
    stopReason: response.stop_reason === "end_turn" ? "endTurn" : "maxTokens",
    role: "assistant",
    content: {
      type: "text",
      text: textContent && textContent.type === "text" ? textContent.text : "",
    },
  };
});

await client.connect(transport);

const cli = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

cli.prompt();

console.log("Type /<command> to start work. Type '/exit' to quit.");

cli.on("line", async (line) => {
  const input = line.trim();

  if (input === "/exit") {
    cli.close();
    process.exit(0);
  }

  if (input.startsWith("/help")) {
    console.log("Command list");
    console.log("/greet - use MPC prompt to greet yourself");
    console.log("/add - add two integer numbers");
    console.log("/summary - provide summary for the text. It will use AI for that");
    console.log("/exit - to terminate work of the client");
    cli.prompt();
    return;
  }

  if(input.startsWith("/summary")) {
    const text = input.slice(9).trim();

    if(!text) {
        console.log("Usage: /summary [text]")
        cli.prompt();
        return;
    }

    if(text) {
        // todo: fix any
        const result: any = await client.callTool({
            name: 'summarize',
            arguments: { text }
        });

        console.log('Summary -> ', result.content[0]?.text);

        cli.prompt();
        return;
    }

    cli.prompt();
    return;
  }

  if (input.startsWith("/add")) {
    const mathString = input.slice(4).trim();
    const match = mathString.match(/^(\d+)\s*\+\s*(\d+)$/);

    if (!match) {
      console.log("Usage: /add a + b");
      cli.prompt();
      return;
    }

    const a = Number(match[1]);
    const b = Number(match[2]);

    // todo: fix any
    const result: any = await client.callTool({
      name: "add",
      arguments: { a, b },
    });
    console.log("Result -> ", result.content[0]?.text);
    cli.prompt();
    return;
  }

  if (input.startsWith("/greet")) {
    const name = input.slice(6).trim();

    if (!name) {
      console.log("Usage: /greet <name>");
      cli.prompt();
      return;
    }

    const result = await client.getPrompt({
      name: "helloPrompt",
      arguments: { name },
    });
    console.log(result.messages[0]?.content.text);
    cli.prompt();
    return;
  }

  console.log("Unknown command.");
  cli.prompt();
});

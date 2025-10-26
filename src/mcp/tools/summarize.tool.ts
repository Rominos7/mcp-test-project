/**
 * Summarize Tool
 *
 * Uses AI (Claude) to generate a concise summary of provided text.
 * Requires Anthropic API client to be passed in.
 */

import Anthropic from "@anthropic-ai/sdk";

// Tool Definition (metadata)
export const summarizeToolDefinition = {
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
} as const;

// Tool Handler (implementation)
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

// Export both for convenience
export default {
  definition: summarizeToolDefinition,
  execute: executeSummarizeTool,
};

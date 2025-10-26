/**
 * Hello Prompt
 *
 * Simple greeting prompt that returns a personalized hello message.
 */

// Prompt Definition (metadata)
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

// Prompt Handler (implementation)
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

// Export both for convenience
export default {
  definition: helloPromptDefinition,
  get: getHelloPrompt,
};

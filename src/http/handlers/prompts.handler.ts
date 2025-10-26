import { PROMPT_DEFINITIONS, getHelloPrompt } from "../../../server-core.js";

/**
 * List all available prompts
 * Uses definitions from server-core (single source of truth)
 */
export async function handlePromptsList() {
  return {
    prompts: Object.values(PROMPT_DEFINITIONS),
  };
}

/**
 * Get a prompt by name
 * Delegates to server-core functions (single source of truth)
 */
export async function handlePromptsGet(params: any) {
  const { name, arguments: args } = params;

  if (name === "helloPrompt") {
    const { name: userName } = args;
    return getHelloPrompt(userName);
  }

  throw new Error(`Unknown prompt: ${name}`);
}

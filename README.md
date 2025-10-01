# MCP Server Weather Example

This repository demonstrates a simple Model Context Protocol (MCP) server and client implementation using Node.js and TypeScript.

## Features
- MCP server with:
  - Tool: `add` (adds two numbers)
  - Tool: `summarize` (summarizes text using AI via client sampling)
  - Resource: `greeting` (returns a greeting for a given name)
  - Prompt: `helloPrompt` (returns a greeting message for a given name)
- Interactive client with command-line support
- Client-provided AI sampling using Anthropic's Claude API
- Local transport using stdio

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Anthropic API key (for AI summarization feature)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd mcp-server-weather
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```sh
   ANTHROPIC_API_KEY=your-api-key-here
   ```
   Get your API key from: https://console.anthropic.com/settings/keys

### Running the Server
Start the MCP server:
```sh
node server.ts
```
Or with ts-node (if using TypeScript directly):
```sh
npx ts-node server.ts
```

### Running the Client
Start the interactive client:
```sh
node client.ts
```


#### Example Commands (in client)
- `/greet Alice` — Get a greeting for Alice using the MCP prompt
- `/add 5 + 7` — Add two integer numbers using the MCP tool
- `/summary <text>` — Summarize text using AI (Claude Sonnet 4.0)
- `/help` — List available commands
- `/exit` — Quit the client

The client is interactive. After starting, type commands at the prompt (`>`):

```
> /greet Alice
Hello, Alice!
> /add 5 + 7
Result -> 12
> /summary The quick brown fox jumps over the lazy dog. This is a pangram sentence.
Summary -> A brief sentence demonstrating a pangram - a phrase containing all letters of the alphabet.
> /help
Command list
/greet - use MCP prompt to greet yourself
/add - add two integer numbers
/summary - summarize text using AI
/exit - to terminate work of the client
> /exit
```
#### Example Screenshots (in client)

<img width="500" height="179" alt="Screenshot 2025-10-01 052252" src="https://github.com/user-attachments/assets/33a76741-1710-471e-aa7f-0f538055c359" />
<img width="891" height="85" alt="Screenshot 2025-10-01 052640" src="https://github.com/user-attachments/assets/67abc1c3-5a87-4dde-a470-e1a1776d635d" />
<img width="128" height="53" alt="Screenshot 2025-10-01 052713" src="https://github.com/user-attachments/assets/7f4373b1-6b4e-47ec-9a98-99dc325c4c46" />
<img width="131" height="57" alt="Screenshot 2025-10-01 052912" src="https://github.com/user-attachments/assets/63a63a2e-0a7e-46e8-9616-21aaf4439374" />


## Project Structure
```
client.ts         # MCP client implementation
server.ts         # MCP server implementation
package.json      # Project dependencies and scripts
tsconfig.json     # TypeScript configuration
README.md         # Project documentation
```

## MCP Server Capabilities
- **Tools**
  - `add`: Adds two numbers
  - `summarize`: Summarizes text using AI (demonstrates MCP sampling/createMessage)
- **Resources**
  - `greeting`: Returns a greeting for a given name
- **Prompts**
  - `helloPrompt`: Returns a greeting message for a given name

## MCP Client Features
- **Sampling Handler**: Implements `sampling/createMessage` to provide AI capabilities to the server
- **AI Model**: Uses Anthropic's Claude Sonnet 4.0 via the Anthropic SDK
- **MCP Concept**: Demonstrates the MCP pattern where the client provides LLM access to the server

## How MCP Sampling Works
This project demonstrates MCP's **sampling** feature:
1. Server registers a tool (`summarize`) that needs AI capabilities
2. Server calls `createMessage()` to request AI completion from the client
3. Client receives the request via its sampling handler
4. Client invokes Claude API and returns the response to the server
5. Server returns the AI-generated summary to the client

This architecture allows servers to leverage AI without directly accessing LLM APIs.

## License
MIT

## Author
Roman Serhiichuk

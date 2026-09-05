import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const isProduction = process.env.NODE_ENV === 'production';

// Pass current process environment variables to child process so Render / production has access to DATABASE_URL etc.
const sanitizedEnv: Record<string, string> = {};
for (const [key, val] of Object.entries(process.env)) {
  if (val !== undefined) {
    sanitizedEnv[key] = val;
  }
}

const transport = new StdioClientTransport({
  command: isProduction ? "node" : "npx",
  args: isProduction 
    ? ["dist/mcp-server/connect.mcp.server.js"] 
    : ["tsx", "src/mcp-server/connect.mcp.server.ts"],
  env: sanitizedEnv,
});

transport.onerror = (error) => {
  console.error("MCP Client transport error:", error);
};

const client = new Client({
  name: "my-ai-client",
  version: "1.0.0",
});

let connectPromise: Promise<void> | null = client.connect(transport).catch((err) => {
  console.error("Failed to connect MCP client:", err);
  connectPromise = null;
});

export async function getClient(): Promise<Client> {
  if (!connectPromise) {
    connectPromise = client.connect(transport).catch((err) => {
      console.error("Failed to connect MCP client:", err);
      connectPromise = null;
      throw err;
    });
  }
  await connectPromise;
  return client;
}
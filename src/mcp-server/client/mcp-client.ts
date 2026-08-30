import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const isProduction = process.env.NODE_ENV === 'production';

const transport = new StdioClientTransport({
  command: isProduction ? "node" : "npx",
  args: isProduction 
    ? ["dist/mcp-server/connect.mcp.server.js"] 
    : ["tsx", "src/mcp-server/connect.mcp.server.ts"],
});

transport.onerror = (error) => {
  console.error("MCP Client transport error:", error);
};

const client = new Client({
  name: "my-ai-client",
  version: "1.0.0",
});

client.connect(transport).catch((err) => {
  console.error("Failed to connect MCP client:", err);
});

export async function getClient(): Promise<Client> {
  return client;
}
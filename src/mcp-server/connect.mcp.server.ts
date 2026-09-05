import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./mcp.server";
import mongoose from "mongoose";
import config from "../config";

process.on('uncaughtException', (err: any) => {
    if (err?.code === 'EPIPE') return;
    console.error('Uncaught Exception:', err);
});

export async function mcpServerConnect() {
    if (config.database_url) {
        await mongoose.connect(config.database_url as string);
        console.error("🚀 Database connected for MCP server");
    } else {
        console.error("⚠️ DATABASE_URL is not defined for MCP server!");
    }

    const transport = new StdioServerTransport();
    transport.onerror = (error) => {
        console.error("MCP Server transport error:", error);
    };

    await server.connect(transport);

    console.error("✅ MCP Server is running...");
}

mcpServerConnect().catch(console.error);
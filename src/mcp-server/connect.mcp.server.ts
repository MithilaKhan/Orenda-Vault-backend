import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./mcp.server";
import mongoose from "mongoose";
import config from "../config";

export async function mcpServerConnect() {
    if (config.database_url) {
        await mongoose.connect(config.database_url as string);
        console.error("🚀 Database connected for MCP server");
    }

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("✅ MCP Server is running...");
}

mcpServerConnect().catch(console.error);
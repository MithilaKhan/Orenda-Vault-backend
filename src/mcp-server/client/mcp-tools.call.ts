import { getClient } from "./mcp-client";

class CallMcpToolsClient {
    constructor() {}
    async callTool(toolName: string, toolInput: any) {
        const client = await getClient();
        const response = await client.callTool({
            name: toolName,
            arguments: JSON.parse(toolInput),
        });
        return response;
    }
}

export const callMcpToolsClient = new CallMcpToolsClient();
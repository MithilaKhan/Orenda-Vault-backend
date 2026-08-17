import { getClient } from "./mcp-client";

class CallMcpToolsClient {
    constructor() {}
    async callTool(toolName: string, toolInput: any, userId: string) {
        const client = await getClient();
        
        let args: any = {};
        if (typeof toolInput === "string") {
            try {
                args = JSON.parse(toolInput);
            } catch (e) {
                args = {};
            }
        } else if (toolInput && typeof toolInput === "object") {
            args = { ...toolInput };
        }
        
        args.userId = userId;

        const response = await client.callTool({
            name: toolName,
            arguments: args,
        });
        return response;
    }
}

export const callMcpToolsClient = new CallMcpToolsClient();
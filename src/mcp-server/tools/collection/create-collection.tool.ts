import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../../app/modules/collection/collection.service";

export function createCollectionTool(server: McpServer) {
    server.registerTool(
        "createCollection",
        {
            title: "Create Collection",
            description: "Creates a new custom workspace collection or folder for the user in the database. Use this tool when the user asks to create, make, or add a new collection to organize their notes or items.",
            inputSchema: {
                title: z.string().describe("The primary name or title for the new collection. E.g., 'My Projects', 'Ideas'."),
                description: z.string().describe("A brief summary or detailed explanation of what this collection will contain."),
                icon: z.enum(["FileText", "Code", "Briefcase", "Folder"]).optional().describe("Visual representation icon for the collection. Choose an appropriate icon based on the collection's context (e.g., 'Briefcase' for work, 'Code' for programming). DO NOT ask the user for an icon; default to 'FileText' if not specified or not mentioned by the user."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ title, description, icon, userId }) => {
            try {
                const result = await CollectionService.createCollectionToDB({ title, description, icon: icon || "FileText", user: userId as any });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Collection created successfully with ID: ${result._id}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to create collection",
                        },
                    ],
                };
            }
        }
    );
}

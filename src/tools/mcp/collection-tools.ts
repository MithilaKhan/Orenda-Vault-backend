import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { CollectionService } from "../../app/modules/collection/collection.service";

export function createCollectionTool(server: McpServer) {
    server.registerTool(
        "createCollection",
        {
            title: "Create Collection",
            description: "Creates a new collection in MongoDB.",
            inputSchema: {
                title: z.string().describe("The title of the collection to create."),
                description: z.string().describe("The description of the collection to create."),
                icon: z.enum(["FileText", "Code", "Briefcase", "Folder"]).describe("The icon of the collection to create."),
                userId: z.string().describe("The ID of the user creating the collection."),
            },
        },
        async ({ title, description, icon, userId }) => {
            try {
                const result = await CollectionService.createCollectionToDB({ title, description, icon, user: userId as any });
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
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";

export function createNoteTool(server: McpServer) {
    server.registerTool(
        "createNote",
        {
            title: "Create Note",
            description: "Creates a new note inside a specific collection. Use this tool when the user asks to create, add, or make a new note, task, or document.",
            inputSchema: {
                title: z.string().describe("The primary name or title for the new note. E.g., 'Meeting Minutes', 'Shopping List'."),
                description: z.string().describe("The main content or body text of the note."),
                collectionId: z.string().describe("The unique identifier (MongoDB Object ID) of the collection where this note will be saved. If you don't know it, use 'getAllCollection' to search for it first."),
                userId: z.string().describe("The unique identifier (MongoDB Object ID) of the user who owns this note."),
            },
        },
        async ({ title, description, collectionId, userId }) => {
            try {
                const result = await NoteService.createNoteToDB({ title, description, collection: collectionId as any, user: userId as any });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Note created successfully with ID: ${result._id}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to create note",
                        },
                    ],
                };
            }
        }
    );
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";

export function getAllNoteTool(server: McpServer) {
    server.registerTool(
        "getAllNote",
        {
            title: "Get All Notes",
            description: "Retrieves a paginated list of all notes owned by a specific user. Use this tool to search for notes by name or fetch all notes across all collections.",
            inputSchema: {
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
                search: z.string().optional().describe("An optional search keyword or query to filter notes by their title. Useful for finding a specific note."),
                page: z.string().optional().describe("The page number for fetching paginated results (e.g., '1', '2'). Defaults to '1'."),
                limit: z.string().optional().describe("The maximum number of notes to return per page (e.g., '10', '20'). Defaults to '10'."),
            },
        },
        async ({ userId, search, page, limit }) => {
            try {
                const result = await NoteService.getAllNoteToDB(userId as string, { search, page, limit });
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to get notes",
                        },
                    ],
                };
            }
        }
    );
}

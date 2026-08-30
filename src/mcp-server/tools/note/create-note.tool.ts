import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";
import { Note } from "../../../app/modules/note/note.model";
import { Collection } from "../../../app/modules/collection/collection.model";
import { CollectionService } from "../../../app/modules/collection/collection.service";
import { cleanTitleString, createTitleRegex, stripSuffixWord } from "../../../app/shared/titleUtils";
import { Types } from "mongoose";

export function createNoteTool(server: McpServer) {
    server.registerTool(
        "createNote",
        {
            title: "Create Note",
            description: "Creates a new note inside a specific collection, or moves/assigns an existing note to a collection. Use this tool when the user asks to create, add, or put a note into a collection.",
            inputSchema: {
                title: z.string().describe("The primary name or title for the note. E.g., 'Meeting Minutes', 'Today's Focus'."),
                description: z.string().optional().describe("The main content or body text of the note."),
                collectionName: z.string().optional().describe("The name/title of the collection (e.g. 'Daily Goals', 'Work') OR the collection ID where this note will be saved."),
                collectionId: z.string().optional().describe("The collection ID or collection name where this note will be saved."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            },
        },
        async ({ title, description, collectionName, collectionId, userId }) => {
            try {
                let targetCollectionId: any = collectionName || collectionId;

                if (targetCollectionId && userId) {
                    const cleanVal = cleanTitleString(targetCollectionId);
                    let foundCol: any = null;

                    // 1. Try finding collection by _id if it's a valid ObjectId
                    if (Types.ObjectId.isValid(cleanVal)) {
                        foundCol = await Collection.findOne({ _id: cleanVal, user: userId });
                    }

                    // 2. Try exact title match (case-insensitive)
                    if (!foundCol) {
                        foundCol = await Collection.findOne({
                            user: userId,
                            title: { $regex: createTitleRegex(cleanVal) }
                        });
                    }

                    // 3. Try stripping trailing words like "collection" or "folder" or "vault"
                    if (!foundCol) {
                        const strippedVal = stripSuffixWord(cleanVal, 'collection');
                        if (strippedVal && strippedVal !== cleanVal) {
                            foundCol = await Collection.findOne({
                                user: userId,
                                title: { $regex: createTitleRegex(strippedVal) }
                            });
                        }
                    }

                    // 4. Try partial title match
                    if (!foundCol) {
                        foundCol = await Collection.findOne({
                            user: userId,
                            title: { $regex: new RegExp(cleanVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                        });
                    }

                    // 5. Auto-create collection if title doesn't exist and is not a random ObjectId
                    if (!foundCol && cleanVal && !Types.ObjectId.isValid(cleanVal)) {
                        const colTitle = stripSuffixWord(cleanVal, 'collection') || cleanVal;
                        foundCol = await CollectionService.createCollectionToDB({
                            title: colTitle,
                            user: userId as any,
                            description: `Collection for ${colTitle}`,
                            icon: "FileText"
                        });
                    }

                    if (foundCol) {
                        targetCollectionId = foundCol._id;
                    } else {
                        targetCollectionId = null;
                    }
                }

                try {
                    const result = await NoteService.createNoteToDB({
                        title,
                        description: description || "No description provided.",
                        collection: targetCollectionId,
                        user: userId as any
                    });

                    return {
                        content: [
                            {
                                type: "text",
                                text: `Note "${title}" created successfully inside collection ID: ${targetCollectionId || 'none'}`,
                            },
                        ],
                    };
                } catch (createError: any) {
                    // Fallback: If note already exists, update its collection link instead of failing
                    if (createError.message && createError.message.includes("already have a Note with this name") && userId) {
                        const titleRegex = createTitleRegex(title);
                        const existingNote = await Note.findOne({ user: userId, title: { $regex: titleRegex } });

                        if (existingNote) {
                            const updatePayload: any = {};
                            if (targetCollectionId) updatePayload.collection = targetCollectionId;
                            if (description && description.trim()) updatePayload.description = description;

                            const updatedNote = await NoteService.updateNoteToDB(existingNote._id.toString(), updatePayload, userId as string);

                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: `Note "${title}" already existed in your vault, so it was successfully updated and assigned to collection ID: ${targetCollectionId || 'none'}.`,
                                    },
                                ],
                            };
                        }
                    }
                    throw createError;
                }
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to create or update note",
                        },
                    ],
                };
            }
        }
    );
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { NoteService } from "../../../app/modules/note/note.service";
import { Note } from "../../../app/modules/note/note.model";
import { Collection } from "../../../app/modules/collection/collection.model";
import { CollectionService } from "../../../app/modules/collection/collection.service";
import { cleanTitleString, createTitleRegex, stripSuffixWord } from "../../../app/shared/titleUtils";
import { Types } from "mongoose";

export function updateNoteTool(server: McpServer) {
    server.registerTool(
        "updateNote",
        {
            title: "Update Note",
            description: "Modifies, edits, or moves an existing note to a collection. Accepts note ID or note name/title, and target collection ID or collection name.",
            inputSchema: {
                id: z.string().optional().describe("The note ID (MongoDB Object ID) OR note name/title to update."),
                noteName: z.string().optional().describe("The name or title of the existing note to update/move (e.g. 'Meeting Minutes', 'secret key')."),
                userId: z.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
                title: z.string().optional().describe("The new updated title for the note if renaming it."),
                description: z.string().optional().describe("The updated content or body text for the note."),
                collectionName: z.string().optional().describe("The name/title of the target collection (e.g. 'Daily Goals', 'orenda vault') where the note should be moved."),
                collectionId: z.string().optional().describe("The target collection ID if moving the note to a different collection."),
            },
        },
        async ({ id, noteName, userId, title, description, collectionName, collectionId }) => {
            try {
                if (!userId) {
                    throw new Error("User ID is required to update a note.");
                }

                // 1. Resolve target Note
                const noteIdentifier = noteName || id;
                if (!noteIdentifier) {
                    throw new Error("Please provide either note ID or note name to update.");
                }

                const cleanNoteVal = cleanTitleString(noteIdentifier);
                let foundNote: any = null;

                if (Types.ObjectId.isValid(cleanNoteVal)) {
                    foundNote = await Note.findOne({ _id: cleanNoteVal, user: userId });
                }

                if (!foundNote) {
                    foundNote = await Note.findOne({
                        user: userId,
                        title: { $regex: createTitleRegex(cleanNoteVal) }
                    });
                }

                if (!foundNote) {
                    const strippedNote = stripSuffixWord(cleanNoteVal, 'note');
                    if (strippedNote && strippedNote !== cleanNoteVal) {
                        foundNote = await Note.findOne({
                            user: userId,
                            title: { $regex: createTitleRegex(strippedNote) }
                        });
                    }
                }

                if (!foundNote) {
                    foundNote = await Note.findOne({
                        user: userId,
                        title: { $regex: new RegExp(cleanNoteVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                    });
                }

                if (!foundNote) {
                    throw new Error(`Could not find a note with title/ID "${cleanNoteVal}" in your vault.`);
                }

                const payload: any = {};
                if (title !== undefined) payload.title = title;
                if (description !== undefined) payload.description = description;

                // 2. Resolve target Collection if moving note
                let targetCol: any = collectionName || collectionId;
                if (targetCol !== undefined && targetCol !== null && String(targetCol).trim() !== "") {
                    const cleanColVal = cleanTitleString(targetCol);
                    let foundCol: any = null;

                    if (Types.ObjectId.isValid(cleanColVal)) {
                        foundCol = await Collection.findOne({ _id: cleanColVal, user: userId });
                    }

                    if (!foundCol) {
                        foundCol = await Collection.findOne({
                            user: userId,
                            title: { $regex: createTitleRegex(cleanColVal) }
                        });
                    }

                    if (!foundCol) {
                        const strippedCol = stripSuffixWord(cleanColVal, 'collection');
                        if (strippedCol && strippedCol !== cleanColVal) {
                            foundCol = await Collection.findOne({
                                user: userId,
                                title: { $regex: createTitleRegex(strippedCol) }
                            });
                        }
                    }

                    if (!foundCol) {
                        foundCol = await Collection.findOne({
                            user: userId,
                            title: { $regex: new RegExp(cleanColVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                        });
                    }

                    if (!foundCol && !Types.ObjectId.isValid(cleanColVal)) {
                        const colTitle = stripSuffixWord(cleanColVal, 'collection') || cleanColVal;
                        foundCol = await CollectionService.createCollectionToDB({
                            title: colTitle,
                            user: userId as any,
                            description: `Collection for ${colTitle}`,
                            icon: "FileText"
                        });
                    }

                    if (foundCol) {
                        payload.collection = foundCol._id;
                    }
                }

                const result = await NoteService.updateNoteToDB(foundNote._id.toString(), payload, userId as string);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Note "${foundNote.title}" updated successfully:\n${JSON.stringify(result, null, 2)}`,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error.message || "Failed to update note",
                        },
                    ],
                };
            }
        }
    );
}

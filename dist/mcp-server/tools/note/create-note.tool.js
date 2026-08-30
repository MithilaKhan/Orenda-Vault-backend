"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteTool = createNoteTool;
const zod_1 = __importDefault(require("zod"));
const note_service_1 = require("../../../app/modules/note/note.service");
const note_model_1 = require("../../../app/modules/note/note.model");
const collection_model_1 = require("../../../app/modules/collection/collection.model");
const collection_service_1 = require("../../../app/modules/collection/collection.service");
const titleUtils_1 = require("../../../app/shared/titleUtils");
const mongoose_1 = require("mongoose");
function createNoteTool(server) {
    server.registerTool("createNote", {
        title: "Create Note",
        description: "Creates a new note inside a specific collection, or moves/assigns an existing note to a collection. Use this tool when the user asks to create, add, or put a note into a collection.",
        inputSchema: {
            title: zod_1.default.string().describe("The primary name or title for the note. E.g., 'Meeting Minutes', 'Today's Focus'."),
            description: zod_1.default.string().optional().describe("The main content or body text of the note."),
            collectionName: zod_1.default.string().optional().describe("The name/title of the collection (e.g. 'Daily Goals', 'Work') OR the collection ID where this note will be saved."),
            collectionId: zod_1.default.string().optional().describe("The collection ID or collection name where this note will be saved."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ title, description, collectionName, collectionId, userId }) {
        try {
            let targetCollectionId = collectionName || collectionId;
            if (targetCollectionId && userId) {
                const cleanVal = (0, titleUtils_1.cleanTitleString)(targetCollectionId);
                let foundCol = null;
                // 1. Try finding collection by _id if it's a valid ObjectId
                if (mongoose_1.Types.ObjectId.isValid(cleanVal)) {
                    foundCol = yield collection_model_1.Collection.findOne({ _id: cleanVal, user: userId });
                }
                // 2. Try exact title match (case-insensitive)
                if (!foundCol) {
                    foundCol = yield collection_model_1.Collection.findOne({
                        user: userId,
                        title: { $regex: (0, titleUtils_1.createTitleRegex)(cleanVal) }
                    });
                }
                // 3. Try stripping trailing words like "collection" or "folder" or "vault"
                if (!foundCol) {
                    const strippedVal = (0, titleUtils_1.stripSuffixWord)(cleanVal, 'collection');
                    if (strippedVal && strippedVal !== cleanVal) {
                        foundCol = yield collection_model_1.Collection.findOne({
                            user: userId,
                            title: { $regex: (0, titleUtils_1.createTitleRegex)(strippedVal) }
                        });
                    }
                }
                // 4. Try partial title match
                if (!foundCol) {
                    foundCol = yield collection_model_1.Collection.findOne({
                        user: userId,
                        title: { $regex: new RegExp(cleanVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                    });
                }
                // 5. Auto-create collection if title doesn't exist and is not a random ObjectId
                if (!foundCol && cleanVal && !mongoose_1.Types.ObjectId.isValid(cleanVal)) {
                    const colTitle = (0, titleUtils_1.stripSuffixWord)(cleanVal, 'collection') || cleanVal;
                    foundCol = yield collection_service_1.CollectionService.createCollectionToDB({
                        title: colTitle,
                        user: userId,
                        description: `Collection for ${colTitle}`,
                        icon: "FileText"
                    });
                }
                if (foundCol) {
                    targetCollectionId = foundCol._id;
                }
                else {
                    targetCollectionId = null;
                }
            }
            try {
                const result = yield note_service_1.NoteService.createNoteToDB({
                    title,
                    description: description || "No description provided.",
                    collection: targetCollectionId,
                    user: userId
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Note "${title}" created successfully inside collection ID: ${targetCollectionId || 'none'}`,
                        },
                    ],
                };
            }
            catch (createError) {
                // Fallback: If note already exists, update its collection link instead of failing
                if (createError.message && createError.message.includes("already have a Note with this name") && userId) {
                    const titleRegex = (0, titleUtils_1.createTitleRegex)(title);
                    const existingNote = yield note_model_1.Note.findOne({ user: userId, title: { $regex: titleRegex } });
                    if (existingNote) {
                        const updatePayload = {};
                        if (targetCollectionId)
                            updatePayload.collection = targetCollectionId;
                        if (description && description.trim())
                            updatePayload.description = description;
                        const updatedNote = yield note_service_1.NoteService.updateNoteToDB(existingNote._id.toString(), updatePayload, userId);
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
        }
        catch (error) {
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
    }));
}

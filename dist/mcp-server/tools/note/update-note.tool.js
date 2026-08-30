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
exports.updateNoteTool = updateNoteTool;
const zod_1 = __importDefault(require("zod"));
const note_service_1 = require("../../../app/modules/note/note.service");
const note_model_1 = require("../../../app/modules/note/note.model");
const collection_model_1 = require("../../../app/modules/collection/collection.model");
const collection_service_1 = require("../../../app/modules/collection/collection.service");
const titleUtils_1 = require("../../../app/shared/titleUtils");
const mongoose_1 = require("mongoose");
function updateNoteTool(server) {
    server.registerTool("updateNote", {
        title: "Update Note",
        description: "Modifies, edits, or moves an existing note to a collection. Accepts note ID or note name/title, and target collection ID or collection name.",
        inputSchema: {
            id: zod_1.default.string().optional().describe("The note ID (MongoDB Object ID) OR note name/title to update."),
            noteName: zod_1.default.string().optional().describe("The name or title of the existing note to update/move (e.g. 'Meeting Minutes', 'secret key')."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
            title: zod_1.default.string().optional().describe("The new updated title for the note if renaming it."),
            description: zod_1.default.string().optional().describe("The updated content or body text for the note."),
            collectionName: zod_1.default.string().optional().describe("The name/title of the target collection (e.g. 'Daily Goals', 'orenda vault') where the note should be moved."),
            collectionId: zod_1.default.string().optional().describe("The target collection ID if moving the note to a different collection."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ id, noteName, userId, title, description, collectionName, collectionId }) {
        try {
            if (!userId) {
                throw new Error("User ID is required to update a note.");
            }
            // 1. Resolve target Note
            const noteIdentifier = noteName || id;
            if (!noteIdentifier) {
                throw new Error("Please provide either note ID or note name to update.");
            }
            const cleanNoteVal = (0, titleUtils_1.cleanTitleString)(noteIdentifier);
            let foundNote = null;
            if (mongoose_1.Types.ObjectId.isValid(cleanNoteVal)) {
                foundNote = yield note_model_1.Note.findOne({ _id: cleanNoteVal, user: userId });
            }
            if (!foundNote) {
                foundNote = yield note_model_1.Note.findOne({
                    user: userId,
                    title: { $regex: (0, titleUtils_1.createTitleRegex)(cleanNoteVal) }
                });
            }
            if (!foundNote) {
                const strippedNote = (0, titleUtils_1.stripSuffixWord)(cleanNoteVal, 'note');
                if (strippedNote && strippedNote !== cleanNoteVal) {
                    foundNote = yield note_model_1.Note.findOne({
                        user: userId,
                        title: { $regex: (0, titleUtils_1.createTitleRegex)(strippedNote) }
                    });
                }
            }
            if (!foundNote) {
                foundNote = yield note_model_1.Note.findOne({
                    user: userId,
                    title: { $regex: new RegExp(cleanNoteVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                });
            }
            if (!foundNote) {
                throw new Error(`Could not find a note with title/ID "${cleanNoteVal}" in your vault.`);
            }
            const payload = {};
            if (title !== undefined)
                payload.title = title;
            if (description !== undefined)
                payload.description = description;
            // 2. Resolve target Collection if moving note
            let targetCol = collectionName || collectionId;
            if (targetCol !== undefined && targetCol !== null && String(targetCol).trim() !== "") {
                const cleanColVal = (0, titleUtils_1.cleanTitleString)(targetCol);
                let foundCol = null;
                if (mongoose_1.Types.ObjectId.isValid(cleanColVal)) {
                    foundCol = yield collection_model_1.Collection.findOne({ _id: cleanColVal, user: userId });
                }
                if (!foundCol) {
                    foundCol = yield collection_model_1.Collection.findOne({
                        user: userId,
                        title: { $regex: (0, titleUtils_1.createTitleRegex)(cleanColVal) }
                    });
                }
                if (!foundCol) {
                    const strippedCol = (0, titleUtils_1.stripSuffixWord)(cleanColVal, 'collection');
                    if (strippedCol && strippedCol !== cleanColVal) {
                        foundCol = yield collection_model_1.Collection.findOne({
                            user: userId,
                            title: { $regex: (0, titleUtils_1.createTitleRegex)(strippedCol) }
                        });
                    }
                }
                if (!foundCol) {
                    foundCol = yield collection_model_1.Collection.findOne({
                        user: userId,
                        title: { $regex: new RegExp(cleanColVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") }
                    });
                }
                if (!foundCol && !mongoose_1.Types.ObjectId.isValid(cleanColVal)) {
                    const colTitle = (0, titleUtils_1.stripSuffixWord)(cleanColVal, 'collection') || cleanColVal;
                    foundCol = yield collection_service_1.CollectionService.createCollectionToDB({
                        title: colTitle,
                        user: userId,
                        description: `Collection for ${colTitle}`,
                        icon: "FileText"
                    });
                }
                if (foundCol) {
                    payload.collection = foundCol._id;
                }
            }
            const result = yield note_service_1.NoteService.updateNoteToDB(foundNote._id.toString(), payload, userId);
            return {
                content: [
                    {
                        type: "text",
                        text: `Note "${foundNote.title}" updated successfully:\n${JSON.stringify(result, null, 2)}`,
                    },
                ],
            };
        }
        catch (error) {
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
    }));
}

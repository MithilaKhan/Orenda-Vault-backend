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
exports.checkTitleTool = checkTitleTool;
const zod_1 = __importDefault(require("zod"));
const note_model_1 = require("../../app/modules/note/note.model");
const collection_model_1 = require("../../app/modules/collection/collection.model");
const titleUtils_1 = require("../../app/shared/titleUtils");
function checkTitleTool(server) {
    server.registerTool("checkTitle", {
        title: "Check Title Availability",
        description: "Checks if a title name is already taken by an existing note or collection for the user. Use this tool whenever a user asks if a title name is available, or before creating/updating notes and collections to avoid duplicate titles.",
        inputSchema: {
            title: zod_1.default.string().describe("The title name to check for availability."),
            userId: zod_1.default.string().optional().describe("Internal user ID. DO NOT ask the user for this under any circumstances."),
        },
    }, (_a) => __awaiter(this, [_a], void 0, function* ({ title, userId }) {
        try {
            if (!userId) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ exists: false, message: "User not authenticated" }),
                        },
                    ],
                };
            }
            const titleRegex = (0, titleUtils_1.createTitleRegex)(title);
            const existingNote = yield note_model_1.Note.findOne({
                user: userId,
                title: { $regex: titleRegex }
            });
            if (existingNote) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                exists: true,
                                type: "note",
                                title: existingNote.title,
                                message: `A note with the title "${existingNote.title}" already exists.`
                            }),
                        },
                    ],
                };
            }
            const existingCollection = yield collection_model_1.Collection.findOne({
                user: userId,
                title: { $regex: titleRegex }
            });
            if (existingCollection) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                exists: true,
                                type: "collection",
                                title: existingCollection.title,
                                message: `A collection with the title "${existingCollection.title}" already exists.`
                            }),
                        },
                    ],
                };
            }
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            exists: false,
                            title: title,
                            message: `The title "${title}" is available.`
                        }),
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
                        text: error.message || "Failed to check title",
                    },
                ],
            };
        }
    }));
}

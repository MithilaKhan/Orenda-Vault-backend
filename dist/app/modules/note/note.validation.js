"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createNoteZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string({ message: "Title is required" }),
        description: zod_1.default.string({ message: "Description is required" }),
        collection: zod_1.default.string({ message: "Collection is required" }).nullable().optional(),
        isFavorite: zod_1.default.boolean().optional(),
    })
});
const updateNoteZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string({ message: "Title is required" }).optional(),
        description: zod_1.default.string({ message: "Description is required" }).optional(),
        collection: zod_1.default.string({ message: "Collection is required" }).nullable().optional(),
        isFavorite: zod_1.default.boolean().optional(),
    })
});
exports.NoteValidation = {
    createNoteZodSchema,
    updateNoteZodSchema
};

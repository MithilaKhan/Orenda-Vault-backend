"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createCollectionZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string({ message: "Title is required" }),
        description: zod_1.default.string({ message: "Description is required" }).optional(),
        icon: zod_1.default.string({ message: "Icon is required" }),
    })
});
const updateCollectionZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string({ message: "Title is required" }).optional(),
        description: zod_1.default.string({ message: "Description is required" }).optional(),
        icon: zod_1.default.string({ message: "Icon is required" }).optional(),
    })
});
exports.CollectionValidation = {
    createCollectionZodSchema,
    updateCollectionZodSchema
};

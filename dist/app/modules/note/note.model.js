"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    collection: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Collection",
        required: false,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
}, { suppressReservedKeysWarning: true, timestamps: true });
exports.Note = (0, mongoose_1.model)("Note", noteSchema);

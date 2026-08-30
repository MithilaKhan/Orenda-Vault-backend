"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const mongoose_1 = require("mongoose");
const chatMessageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    toolResult: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null
    }
}, { timestamps: true });
const chatSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    messages: [chatMessageSchema]
}, { timestamps: true });
exports.Chat = (0, mongoose_1.model)("Chat", chatSchema);

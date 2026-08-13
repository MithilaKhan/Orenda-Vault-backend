"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const mongoose_1 = require("mongoose");
const collectionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    icon: {
        type: String,
        default: ""
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });
exports.Collection = (0, mongoose_1.model)("Collection", collectionSchema);

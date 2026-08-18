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
exports.NoteService = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const note_model_1 = require("./note.model");
const http_status_codes_1 = require("http-status-codes");
const createNoteToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.hasOwnProperty('collection')) {
        const colStr = String(payload.collection).trim();
        if (!payload.collection || colStr === "" || colStr === "null" || colStr === "undefined" || colStr === "No Collection (General)") {
            payload.collection = null;
        }
    }
    const isExist = yield note_model_1.Note.findOne({ user: payload.user, title: payload.title });
    if (isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You already have a Note with this name!");
    }
    const note = yield note_model_1.Note.create(payload);
    return note;
});
const getAllNoteToDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = query.search;
    const searchFilters = searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {};
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = Object.assign({ user: userId }, searchFilters);
    const allNote = yield note_model_1.Note.find(filter).populate('collection', "title icon").sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = yield note_model_1.Note.countDocuments(filter);
    return {
        meta: {
            page,
            limit,
            total
        },
        data: allNote
    };
});
const updateNoteToDB = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.hasOwnProperty('collection')) {
        const colStr = String(payload.collection).trim();
        if (!payload.collection || colStr === "" || colStr === "null" || colStr === "undefined" || colStr === "No Collection (General)") {
            payload.collection = null;
        }
    }
    const isExist = yield note_model_1.Note.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Note not found!");
    }
    if (isExist.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to update this Note!");
    }
    const result = yield note_model_1.Note.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteNoteToDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield note_model_1.Note.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Note not found!");
    }
    if (isExist.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to delete this Note!");
    }
    const result = yield note_model_1.Note.findByIdAndDelete(id);
    return result;
});
exports.NoteService = { createNoteToDB, getAllNoteToDB, updateNoteToDB, deleteNoteToDB };

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
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const titleUtils_1 = require("../../shared/titleUtils");
const collection_model_1 = require("../collection/collection.model");
const note_model_1 = require("./note.model");
/**
 * Normalizes optional collection reference ID in payload.
 */
const sanitizeCollectionRef = (payload) => {
    if (payload.hasOwnProperty('collection')) {
        const colStr = String(payload.collection).trim();
        if (!payload.collection || colStr === "" || colStr === "null" || colStr === "undefined" || colStr === "No Collection (General)") {
            payload.collection = null;
        }
    }
};
/**
 * Creates a new note in DB after enforcing title uniqueness across Notes & Collections.
 */
const createNoteToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    sanitizeCollectionRef(payload);
    const titleRegex = (0, titleUtils_1.createTitleRegex)(payload.title);
    const isExistNote = yield note_model_1.Note.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistNote) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You already have a Note with this name!");
    }
    const isExistCollection = yield collection_model_1.Collection.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistCollection) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "A Collection with this name already exists! Notes and Collections cannot share the same title.");
    }
    const note = yield note_model_1.Note.create(payload);
    return note;
});
/**
 * Retrieves paginated list of notes owned by user with optional keyword search.
 */
const getAllNoteToDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchFilters = (0, titleUtils_1.buildFuzzySearchFilter)(query.search, ["title", "content"]);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;
    const filter = Object.assign({ user: userId }, searchFilters);
    const allNote = yield note_model_1.Note.find(filter)
        .populate('collection', "title icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = yield note_model_1.Note.countDocuments(filter);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: allNote,
    };
});
/**
 * Updates an existing note after verifying authorization and title uniqueness.
 */
const updateNoteToDB = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    sanitizeCollectionRef(payload);
    const isExist = yield note_model_1.Note.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Note not found!");
    }
    if (isExist.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to update this Note!");
    }
    if (payload.title) {
        const titleRegex = (0, titleUtils_1.createTitleRegex)(payload.title);
        const existingNote = yield note_model_1.Note.findOne({
            _id: { $ne: id },
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingNote) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You already have a Note with this name!");
        }
        const existingCollection = yield collection_model_1.Collection.findOne({
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingCollection) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "A Collection with this name already exists! Notes and Collections cannot share the same title.");
        }
    }
    const result = yield note_model_1.Note.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
/**
 * Deletes a note from DB after authorization check.
 */
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
exports.NoteService = {
    createNoteToDB,
    getAllNoteToDB,
    updateNoteToDB,
    deleteNoteToDB,
};

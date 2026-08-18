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
exports.CollectionService = void 0;
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const note_model_1 = require("../note/note.model");
const collection_model_1 = require("./collection.model");
const http_status_codes_1 = require("http-status-codes");
const createCollectionToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield collection_model_1.Collection.findOne({ user: payload.user, title: payload.title });
    if (isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You already have a collection with this name!");
    }
    const collection = yield collection_model_1.Collection.create(payload);
    return collection;
});
const getAllCollectionToDB = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = query.search;
    const searchFilters = searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {};
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = Object.assign({ user: userId }, searchFilters);
    const allCollection = yield collection_model_1.Collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = yield collection_model_1.Collection.countDocuments(filter);
    return {
        meta: {
            page,
            limit,
            total
        },
        data: allCollection
    };
});
const getCollectionByIdToDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isCollection = yield collection_model_1.Collection.findById(id);
    if (!isCollection) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Collection not found!");
    }
    if (isCollection.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You do not have permission to access this collection!");
    }
    const notes = yield note_model_1.Note.find({ collection: id, user: userId }).sort({ createdAt: -1 });
    return Object.assign(Object.assign({}, isCollection.toObject()), { notes: notes });
});
const updateCollectionToDB = (id, payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield collection_model_1.Collection.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Collection not found!");
    }
    if (isExist.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to update this collection!");
    }
    const result = yield collection_model_1.Collection.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deleteCollectionToDB = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield collection_model_1.Collection.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Collection not found!");
    }
    if (isExist.user.toString() !== userId) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You are not authorized to delete this collection!");
    }
    const result = yield collection_model_1.Collection.findByIdAndDelete(id);
    return result;
});
exports.CollectionService = { createCollectionToDB, getAllCollectionToDB, getCollectionByIdToDB, updateCollectionToDB, deleteCollectionToDB };

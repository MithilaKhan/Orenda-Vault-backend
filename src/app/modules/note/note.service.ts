import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { buildFuzzySearchFilter, createTitleRegex } from "../../shared/titleUtils";
import { Collection } from "../collection/collection.model";
import { Inote } from "./note.interface";
import { Note } from "./note.model";


/**
 * Normalizes optional collection reference ID in payload.
 */
const sanitizeCollectionRef = (payload: Partial<Inote>): void => {
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
const createNoteToDB = async (payload: Inote) => {
    sanitizeCollectionRef(payload);

    const titleRegex = createTitleRegex(payload.title);

    const isExistNote = await Note.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistNote) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a Note with this name!");
    }

    const isExistCollection = await Collection.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistCollection) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "A Collection with this name already exists! Notes and Collections cannot share the same title.");
    }

    const note = await Note.create(payload);
    return note;
};

/**
 * Retrieves paginated list of notes owned by user with optional keyword search.
 */
const getAllNoteToDB = async (userId: string, query: { search?: string; page?: string; limit?: string }) => {
    const searchFilters = buildFuzzySearchFilter(query.search, ["title", "content"]);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { user: userId, ...searchFilters };

    const allNote = await Note.find(filter)
        .populate('collection', "title icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Note.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: allNote,
    };
};

/**
 * Updates an existing note after verifying authorization and title uniqueness.
 */
const updateNoteToDB = async (id: string, payload: Partial<Inote>, userId: string) => {
    sanitizeCollectionRef(payload);

    const isExist = await Note.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Note not found!");
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this Note!");
    }

    if (payload.title) {
        const titleRegex = createTitleRegex(payload.title);

        const existingNote = await Note.findOne({
            _id: { $ne: id },
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingNote) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a Note with this name!");
        }

        const existingCollection = await Collection.findOne({
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingCollection) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "A Collection with this name already exists! Notes and Collections cannot share the same title.");
        }
    }

    const result = await Note.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

/**
 * Deletes a note from DB after authorization check.
 */
const deleteNoteToDB = async (id: string, userId: string) => {
    const isExist = await Note.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Note not found!");
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to delete this Note!");
    }

    const result = await Note.findByIdAndDelete(id);
    return result;
};

export const NoteService = {
    createNoteToDB,
    getAllNoteToDB,
    updateNoteToDB,
    deleteNoteToDB,
};
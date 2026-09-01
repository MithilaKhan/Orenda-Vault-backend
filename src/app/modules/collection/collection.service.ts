import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { buildFuzzySearchFilter, createTitleRegex } from "../../shared/titleUtils";
import { Note } from "../note/note.model";
import { Icollection } from "./collection.interface";
import { Collection } from "./collection.model";

/**
 * Creates a new collection in DB after enforcing title uniqueness across Collections & Notes.
 */
const createCollectionToDB = async (payload: Icollection) => {
    const titleRegex = createTitleRegex(payload.title);

    const isExistCollection = await Collection.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistCollection) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a collection with this name!");
    }

    const isExistNote = await Note.findOne({ user: payload.user, title: { $regex: titleRegex } });
    if (isExistNote) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "A Note with this name already exists! Notes and Collections cannot share the same title.");
    }

    const collection = await Collection.create(payload);
    return collection;
};

/**
 * Retrieves paginated collections for an authenticated user with optional keyword search.
 */
const getAllCollectionToDB = async (userId: string, query: { search?: string; page?: string; limit?: string }) => {
    const searchFilters = buildFuzzySearchFilter(query.search, ["title"]);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { user: userId, ...searchFilters };

    const allCollection = await Collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Collection.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: allCollection,
    };
};

/**
 * Fetches a single collection by ID along with its associated notes.
 */
const getCollectionByIdToDB = async (id: string, userId: string) => {
    const isCollection = await Collection.findById(id);

    if (!isCollection) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Collection not found!");
    }

    if (isCollection.user.toString() !== userId) {
        throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to access this collection!");
    }

    const notes = await Note.find({ collection: id, user: userId }).sort({ createdAt: -1 });

    return {
        ...isCollection.toObject(),
        notes,
    };
};

/**
 * Updates a collection after validating ownership and title uniqueness.
 */
const updateCollectionToDB = async (id: string, payload: Partial<Icollection>, userId: string) => {
    const isExist = await Collection.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Collection not found!");
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this collection!");
    }

    if (payload.title) {
        const titleRegex = createTitleRegex(payload.title);

        const existingCollection = await Collection.findOne({
            _id: { $ne: id },
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingCollection) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a collection with this name!");
        }

        const existingNote = await Note.findOne({
            user: userId,
            title: { $regex: titleRegex },
        });
        if (existingNote) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "A Note with this name already exists! Notes and Collections cannot share the same title.");
        }
    }

    const result = await Collection.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

/**
 * Deletes a collection after verifying authorization.
 */
const deleteCollectionToDB = async (id: string, userId: string) => {
    const isExist = await Collection.findById(id);

    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Collection not found!");
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to delete this collection!");
    }

    const result = await Collection.findByIdAndDelete(id);
    return result;
};

export const CollectionService = {
    createCollectionToDB,
    getAllCollectionToDB,
    getCollectionByIdToDB,
    updateCollectionToDB,
    deleteCollectionToDB,
};
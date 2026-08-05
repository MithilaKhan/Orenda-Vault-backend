import ApiError from "../../../errors/ApiError";
import { Inote } from "./note.interface";
import { Note } from "./note.model";
import { StatusCodes } from "http-status-codes";

const createNoteToDB = async (payload: Inote) => {
    const isExist = await Note.findOne({ user: payload.user, title: payload.title })
    if (isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a Note with this name!")
    }

    const note = await Note.create(payload)
    return note
}

const getAllNoteToDB = async (userId: string, query: { search?: string, page?: string, limit?: string }) => {
    const searchTerm = query.search
    const searchFilters = searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {}
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { user: userId, ...searchFilters }

    const allNote = await Note.find(filter).populate('collection',"title icon").sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await Note.countDocuments(filter)

    return {
        meta: {
            page,
            limit,
            total
        },
        data: allNote
    }
}

const updateNoteToDB = async (id: string, payload: Partial<Inote>, userId: string) => {
    const isExist = await Note.findById(id)
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Note not found!")
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this Note!")
    }

    const result = await Note.findByIdAndUpdate(id, payload, { new: true })
    return result
}

const deleteNoteToDB = async (id: string, userId: string) => {
    const isExist = await Note.findById(id)

    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Note not found!")
    }

    if (isExist.user.toString() !== userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to delete this Note!")
    }

    const result = await Note.findByIdAndDelete(id)
    return result

}


export const NoteService = { createNoteToDB, getAllNoteToDB, updateNoteToDB, deleteNoteToDB } 
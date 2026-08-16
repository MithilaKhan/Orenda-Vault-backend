import { model, Schema } from "mongoose";
import { NoteModel, Inote } from "./note.interface";

const noteSchema = new Schema<Inote, NoteModel>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    collection: {
        type: Schema.Types.ObjectId,
        ref: "Collection",
        required: false,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
}, { suppressReservedKeysWarning: true, timestamps: true })

export const Note = model<Inote, NoteModel>("Note", noteSchema)
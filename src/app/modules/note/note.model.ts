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
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

export const Note = model<Inote, NoteModel>("Note", noteSchema)
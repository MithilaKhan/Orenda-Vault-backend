import { Model, Types } from "mongoose";

export type Inote = {
    title: string,
    description: string,
    collection?: Types.ObjectId | null,
    user: Types.ObjectId,
    isFavorite?: boolean,
}

export type NoteModel = Model<Inote>;
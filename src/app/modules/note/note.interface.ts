import { Model, Types } from "mongoose";

export type Inote = {
    title: string,
    description: string,
    collection?: Types.ObjectId,
    user: Types.ObjectId,
}

export type NoteModel = Model<Inote>;
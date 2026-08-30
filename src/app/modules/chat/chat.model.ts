import { model, Schema } from "mongoose";
import { ChatModel, IChat } from "./chat.interface";

const chatMessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  toolResult: {
    type: Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

const chatSchema = new Schema<IChat, ChatModel>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  messages: [chatMessageSchema]
}, { timestamps: true });

export const Chat = model<IChat, ChatModel>("Chat", chatSchema);

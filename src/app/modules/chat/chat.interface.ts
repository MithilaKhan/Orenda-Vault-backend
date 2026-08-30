import { Model, Types } from "mongoose";

export type IChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolResult?: any;
  createdAt?: Date;
};

export type IChat = {
  user: Types.ObjectId;
  messages: IChatMessage[];
};

export type ChatModel = Model<IChat>;

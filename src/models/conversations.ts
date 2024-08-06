import mongoose from "mongoose";

import { Document } from "mongoose";
import { Types } from 'mongoose';
export interface IConversation extends Document {
  _id: Types.ObjectId,
  conversation_id: string;
  user: Types.ObjectId;
  friend: Types.ObjectId;
  messages: Array<any>
  createdAt: Date
}


const conversationSchema = new mongoose.Schema(
  {
    _id: { type: Types.ObjectId },
    conversation_id: {
        type: Types.ObjectId,
        required: true,
        unique: true
    },
    user: { type: Types.ObjectId, ref: 'User' },
    friend: { type: Types.ObjectId, ref: 'User' },
    messages: [{ type: Types.ObjectId, ref: 'Message'}],
    createdAt: {type: Date, default: new Date().getTime()},
  },
);

export default mongoose.model<IConversation>("Conversation", conversationSchema);


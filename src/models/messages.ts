import mongoose , {Document} from "mongoose";


export interface IMessage extends Document {
    message: string;
    from: mongoose.Types.ObjectId;
    to: mongoose.Types.ObjectId;
    conversation: mongoose.Types.ObjectId;
    timestamp: Date
  }


const messageSchema = new mongoose.Schema(
  {
    message: {
        type: String,
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    timestamp: {
        type: Date, 
        default: new Date().getTime()
    }
  },
);

export default mongoose.model<IMessage>("Message", messageSchema);

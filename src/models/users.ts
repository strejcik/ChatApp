import mongoose , {Schema, Document} from "mongoose";
export interface IUser extends Document {
  email: string;
  password: string;
  conversation: Array<mongoose.Types.ObjectId>;
  friends: Array<mongoose.Types.ObjectId>
  createdAt: Date
}

const userSchema:Schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "/static/images/avatar/2.jpg"
    },
    name: {
      type: String,
      default: "o.o"
    },
    online: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      default: "@o.o"
    },
    password: {
      type: String,
      required: true,
    },
    baseKeyId: {
      type: Number,
      required: true
    },
    identityKeyPair: {
      privKey: {
        type: Buffer,
        required: true,
      },
      pubKey: {
        type: Buffer,
        required: true,
      }
    },
    preKey: {
      keyId: {
        type: Number,
        required: true
      },
      keyPair: {
        privKey: {
          type: Buffer,
          required: true,
        },
        pubKey: {
          type: Buffer,
          required: true,
        }
      }
    },
    signedPreKey: {
      keyId: {
        type: Number,
        required: true
      },
      keyPair: {
        privKey: {
          type: Buffer,
          required: true,
        },
        pubKey: {
          type: Buffer,
          required: true,
        }
      },
      signature: {
        type: Buffer,
        required: true,
      }
    },
    signedPreKeyId: {
      type: Number,
      required: true
    },
    conversation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: []}],
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      default: [],
    }],
    createdAt: {type: Date, default: new Date().getTime()},
  },
);

export default mongoose.model<IUser>("User", userSchema);
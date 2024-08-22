"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
    conversation: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Conversation', default: [] }],
    friends: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            default: [],
        }],
    createdAt: { type: Date, default: new Date().getTime() },
});
exports.default = mongoose_1.default.model("User", userSchema);

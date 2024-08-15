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
    bki: {
        type: Number,
        required: true
    },
    ikp: {
        prk: {
            type: Buffer,
            required: true,
        },
        pbk: {
            type: Buffer,
            required: true,
        }
    },
    pk: {
        ki: {
            type: Number,
            required: true
        },
        kp: {
            prk: {
                type: Buffer,
                required: true,
            },
            pbk: {
                type: Buffer,
                required: true,
            }
        }
    },
    spk: {
        ki: {
            type: Number,
            required: true
        },
        kp: {
            prk: {
                type: Buffer,
                required: true,
            },
            pbk: {
                type: Buffer,
                required: true,
            }
        },
        si: {
            type: Buffer,
            required: true,
        }
    },
    spki: {
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

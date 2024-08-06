"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const conversationSchema = new mongoose_1.default.Schema({
    _id: { type: mongoose_2.Types.ObjectId },
    conversation_id: {
        type: mongoose_2.Types.ObjectId,
        required: true,
        unique: true
    },
    user: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    friend: { type: mongoose_2.Types.ObjectId, ref: 'User' },
    messages: [{ type: mongoose_2.Types.ObjectId, ref: 'Message' }],
    createdAt: { type: Date, default: new Date().getTime() },
});
exports.default = mongoose_1.default.model("Conversation", conversationSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    message: {
        type: String,
        required: true,
    },
    from: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    to: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    conversation: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Conversation' },
    timestamp: {
        type: Date,
        default: new Date().getTime()
    }
});
exports.default = mongoose_1.default.model("Message", messageSchema);

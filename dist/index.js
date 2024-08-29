"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socketFunctions_1 = require("./socketFunctions");
const body_parser_1 = __importDefault(require("body-parser"));
const connect_mongo_js_1 = __importDefault(require("./utils/connect-mongo.js"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const index_1 = require("./mongooseFunctions/index");
//import s from './socket';
require('dotenv').config();
const app = require("express")();
const cors = require('cors');
const socket = require("socket.io");
//Middleware
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
//Routes
app.use('/api', userRoutes_1.default);
// MongoDB Connection
(0, connect_mongo_js_1.default)();
let server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
const io = socket(server, {
    cors: {
        origin: "http://localhost:3000"
    },
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true,
    allowEIO3: true
});
//require('./socket')(io);
io.use(function (socket, next) {
    if (socket.handshake.auth.token) {
        jsonwebtoken_1.default.verify(socket.handshake.auth.token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                console.log(err);
                return next(new Error('Authentication error'));
            }
            socket.decoded = decoded;
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
}).on("connection", (s) => {
    console.log(`⚡: ${s.id} user just connected!`);
    (0, socketFunctions_1.addUser)(s.decoded.userId, s.id);
    s.on("sxGetMyId", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(s.decoded.userId);
        yield (0, index_1.sGetMyId)(s.decoded.userId).then(r => s.emit("sxGetMyId", r));
    }));
    s.on("sGetFriendId", (id) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(id);
        yield (0, index_1.sGetFriendId)(id).then(r => {
            console.log(r);
            s.emit("sGetFriendId", r);
        });
    }));
    s.on("sAddMessage", (d) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.sAddMessage)(d.userId, d.friendId, d.message).then(() => s === null || s === void 0 ? void 0 : s.to((0, socketFunctions_1.getUserSocket)(d.friendId)).emit('refreshMessages', { message: d.message, user: d.userId }));
    }));
    s.on("addUser", userId => {
        (0, index_1.mongoFindUser)(userId).then(e => (0, socketFunctions_1.addUser)(e === null || e === void 0 ? void 0 : e._id, s.id));
        //console.log(users);
        //socket.emit("getUsers", users);
    });
    s.on("getFriends", (id) => {
        (0, index_1.getFriends)(id).then(f => console.log(f));
    });
    s.on("removeFriend", (id) => {
        (0, index_1.removeFriend)(id.userId, id.friendId);
    });
    s.on("getFriend", (id) => {
        (0, index_1.getFriend)(id.userId, id.friendId);
    });
    s.on("addFriend", (id) => {
        (0, index_1.addFriend)(id.userId, id.friendId);
    });
    s.on("populateFriends", (id) => {
        (0, index_1.populateFriends)(id);
    });
    s.on("getMessages", (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.getMessages)(id.userId, id.friendId);
    }));
    s.on("addMessage", (d) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.addMessage)(d.userId, d.friendId, d.message).then(() => s.to((0, socketFunctions_1.getUserSocket)(d.friendId)).emit('refreshMessages', { message: d.message, user: d.userId }));
    }));
    s.on("getConversations", (id) => __awaiter(void 0, void 0, void 0, function* () {
        // await getConversations(id);
        yield (0, index_1.getConversations)(id).then(r => s.emit("getConversations", r));
    }));
    s.on("getConversation", (id) => __awaiter(void 0, void 0, void 0, function* () {
        //DISPLAY ONLY LAST 25 MESSAGES, CHANGE THE LOGIC IF YOU WANT TO DISPLAY ALL THE MESSAGES
        const page = 2;
        const limit = 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        yield (0, index_1.getConversation)(id.userId, id.conversation_id).then(r => {
            let msgLength = r[0]["messages"].length;
            if (msgLength >= 25) {
                const temp = r[0]["messages"].slice(startIndex + msgLength - endIndex, startIndex + msgLength);
                let resultMessages = r;
                resultMessages[0]["messages"] = temp;
                s.emit("getConversation", resultMessages);
            }
            if (msgLength < 25) {
                s.emit("getConversation", r);
            }
        });
    }));
    s.on("getChunkOfConversation", (d) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.getConversation)(d.userId, d.conversation_id).then(r => {
            let page = d.page;
            let limit = 25;
            let msgLength = r[0]["messages"].length;
            let endIndex = msgLength - (page - 1) * limit;
            let startIndex = Math.max(0, endIndex - limit);
            const temp = r[0]["messages"].slice(startIndex, endIndex);
            let resultMessages = r;
            resultMessages[0]["messages"] = temp;
            s.emit("getChunkOfConversation", resultMessages);
        });
    }));
    s.on("getConversationByFriendId", (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.getConversationByFriendId)(id.userId, id.frienId);
    }));
    s.on("getContactList", (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.getContactList)(id).then(r => s.emit("getContactList", r));
        // await getContactList(id).then(r=> console.log(r));
    }));
    s.on("populateUser", (id) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.populateUser)(id);
    }));
    s.on("getMyId", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.getMyId)(s.decoded.userId).then(r => s.emit("getMyId", r));
    }));
    s.on("disconnect", () => {
        console.log('🔥: A user disconnected');
        (0, socketFunctions_1.removeUser)(s.id);
        //s.emit("getUsers", users);
        //s.broadcast.emit("callEnded");
    });
});

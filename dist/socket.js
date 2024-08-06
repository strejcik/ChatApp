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
const index_1 = require("./mongooseFunctions/index");
module.exports = function (socket) {
    let users = [];
    const addUser = (userId, socketId) => {
        !users.some(user => user.userId === userId) &&
            !users.some(user => user.socketId === socketId) &&
            users.push({ userId, socketId });
    };
    const removeUser = (socketId) => {
        users = users.filter(user => user.socketId !== socketId);
    };
    const getUser = (userId) => {
        return users.find(user => user.userId === userId);
    };
    const getUserSocket = (userId) => {
        return users.find(user => user.userId === userId)["socketId"];
    };
    const getU = (socketId) => {
        return users.find(user => user.socketId === socketId);
    };
    socket.use(function (socket, next) {
        if (socket.handshake.auth.token) {
            jsonwebtoken_1.default.verify(socket.handshake.auth.token, process.env.JWT_SECRET, function (err, decoded) {
                if (err)
                    return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        }
        else {
            next(new Error('Authentication error'));
        }
    }).on("connection", (s) => {
        console.log(`⚡: ${s.id} user just connected!`);
        addUser(s.decoded.userId, s.id);
        // s.on("message", () => {
        //     socket.emit("message", "kurdebele");
        // })
        s.on("addUser", userId => {
            (0, index_1.mongoFindUser)(userId).then(e => addUser(e === null || e === void 0 ? void 0 : e._id, s.id));
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
        s.on("getMessages", (id) => __awaiter(this, void 0, void 0, function* () {
            yield (0, index_1.getMessages)(id.userId, id.friendId).then(() => socket.to(getUserSocket(id.userId)).emit('refreshMessages'));
        }));
        s.on("addMessage", (d) => __awaiter(this, void 0, void 0, function* () {
            yield (0, index_1.addMessage)(d.userId, d.friendId, d.message);
        }));
        s.on("getConversations", (id) => __awaiter(this, void 0, void 0, function* () {
            // await getConversations(id);
            yield (0, index_1.getConversations)(id).then(r => s.emit("getConversations", r));
        }));
        s.on("populateUser", (id) => __awaiter(this, void 0, void 0, function* () {
            yield (0, index_1.populateUser)(id);
        }));
        s.on("getMyId", () => __awaiter(this, void 0, void 0, function* () {
            yield (0, index_1.getMyId)(s.decoded.userId).then(r => s.emit("getMyId", r));
        }));
        // socket.on('getMe', (u) => {
        //     socket.emit("me", getUser(u)["socketId"]);
        // });
        // socket.on("refreshOnlineUsers", () => {
        //     socket.emit("getUsers", users);
        // });
        // socket.on('callUser', (data)=>{
        //     socket.to(getU(data.userToCall)?.["socketId"]).emit('hey', {signal: data.signalData, from: data.from})
        // })
        // socket.on('acceptCall', (data)=>{
        //     socket.to(getU(data.to)["socketId"]).emit('callAccepted', data.signal)
        // })
        // socket.on('close', (data)=>{
        //     socket.to(getU(data.to)?.["socketId"]).emit('close');
        // })
        // socket.on('rejected', (data)=>{
        //     socket.to(getU(data.to)["socketId"]).emit('rejected')
        // })
        //send and get message
        // socket.on("sendMessage", ({senderId, receiverId, text}) => {
        //     const user = getUser(receiverId);
        //     socket.to(user?.socketId).emit("getMessage", {
        //         senderId,
        //         text
        //     })
        // });
        s.on("disconnect", () => {
            console.log('🔥: A user disconnected');
            removeUser(socket.id);
            //s.emit("getUsers", users);
            s.broadcast.emit("callEnded");
        });
    });
};

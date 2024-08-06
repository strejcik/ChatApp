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
exports.addMessage = exports.getContactList = exports.getConversationByFriendId = exports.getConversation = exports.getConversations = exports.getMessages = exports.removeFriend = exports.getMyId = exports.populateUser = exports.populateFriends = exports.getFriends = exports.getFriend = exports.addFriend = exports.mongoFindUser = void 0;
const users_1 = __importDefault(require("../models/users"));
const conversations_1 = __importDefault(require("../models/conversations"));
const messages_1 = __importDefault(require("../models/messages"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongoFindUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return users_1.default.findOne({ _id: id }).exec();
});
exports.mongoFindUser = mongoFindUser;
/*
const conversationSchema = new mongoose.Schema(
  {
    conversation_id: {
        type: String,
        required: true,
        unique: true
    },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    createdAt: {type: Date, default: new Date().getTime()},
  },
);
*/
const addFriend = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    const friend = yield (0, exports.mongoFindUser)(friendId);
    const getFriendId = yield (0, exports.getFriend)(userId, friendId);
    if (user && friend && !getFriendId) {
        const conv = yield conversations_1.default.create({
            _id: new mongoose_1.default.Types.ObjectId(),
            conversation_id: new mongoose_1.default.Types.ObjectId(),
            user: user._id,
            friend: friend._id,
            messages: [],
        });
        user.friends = [...user.friends, friendId];
        user.conversation.push(conv._id);
        yield conv.save();
        yield user.save();
    }
    else {
        console.log('Friend already been added to friendlist.');
    }
});
exports.addFriend = addFriend;
const getFriend = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    let friend;
    const user = yield (0, exports.mongoFindUser)(userId);
    yield Promise.all(friend = user.friends.filter(e => String(e._id) === friendId));
    return String(friend);
});
exports.getFriend = getFriend;
const getFriends = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let friendList = [];
    const user = yield (0, exports.mongoFindUser)(id);
    yield Promise.all(user.friends.map((friend) => {
        friendList.push(String(friend));
    }));
    return friendList;
});
exports.getFriends = getFriends;
const populateFriends = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const friends = yield users_1.default.findOne({ _id: id })
        .populate({
        path: "friends",
        model: "User"
    })
        .exec();
    console.log(friends === null || friends === void 0 ? void 0 : friends.friends);
    return friends === null || friends === void 0 ? void 0 : friends.friends;
});
exports.populateFriends = populateFriends;
const populateUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const u = yield conversations_1.default.findOne({ id: id })
        .populate({
        path: "user",
        model: "User"
    })
        .exec();
    return u;
});
exports.populateUser = populateUser;
const getMyId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(id);
    return yield (user === null || user === void 0 ? void 0 : user._id);
});
exports.getMyId = getMyId;
const removeFriend = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield (0, exports.mongoFindUser)(userId);
    yield Promise.all(user.friends = user.friends.filter(e => String(e._id) !== friendId));
    yield user.save();
});
exports.removeFriend = removeFriend;
const getMessages = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    const friend = yield (0, exports.mongoFindUser)(friendId);
    const getFriendId = yield (0, exports.getFriend)(userId, friendId);
    if (user && friend && getFriendId) {
        return yield conversations_1.default.findOne({ user: userId, friend: friendId })
            .populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message'
        }).exec();
    }
});
exports.getMessages = getMessages;
const getConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    if (user) {
        return yield conversations_1.default.find({ user: userId })
            .populate({
            strictPopulate: false,
            path: "user",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "friend",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'from',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'to',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).exec();
    }
});
exports.getConversations = getConversations;
const getConversation = (userId, convId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    if (user) {
        return yield conversations_1.default.find({ user: userId, conversation_id: convId })
            .populate({
            strictPopulate: false,
            path: "user",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "friend",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'from',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'to',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).exec();
    }
});
exports.getConversation = getConversation;
const getConversationByFriendId = (userId, friendId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    if (user) {
        return yield conversations_1.default.find({ user: userId, friend: friendId })
            .populate({
            strictPopulate: false,
            path: "user",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "friend",
            model: 'User',
            select: 'avatar name online username',
        })
            .populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'from',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).populate({
            strictPopulate: false,
            path: "messages",
            model: 'Message',
            select: 'messages to from message conversation timestamp',
            populate: {
                path: 'to',
                model: 'User',
                select: '_id email avatar name online username'
            },
        }).exec();
    }
});
exports.getConversationByFriendId = getConversationByFriendId;
const getContactList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.mongoFindUser)(userId);
    if (user) {
        return yield conversations_1.default.find({ user: userId })
            .populate({
            strictPopulate: false,
            path: "friend",
            model: 'User',
            select: 'avatar name online username',
        }).select("friend conversation_id -_id").exec();
    }
});
exports.getContactList = getContactList;
// export const addMessageForFriend = async (friendId, userId, message="asd") => {
//   const user = await mongoFindUser(userId);
//   const friend = await mongoFindUser(friendId);
//   const myConv = await User.findOne({_id: userId})
//   .populate({
//     strictPopulate: false,
//     path:"conversation",
//     model: "Conversation"
//   })
//   .exec();
//   const friendConv = await User.findOne({_id: friendId})
//   .populate({
//     strictPopulate: false,
//     path:"conversation",
//     model: "Conversation"
//   })
//   .exec();
//   myConv?.conversation.forEach(e => {
//     if(e["user"].toString() === userId && e["friend"].toString() === friendId) {
//       const msg = Message.create({
//         _id: new mongoose.Types.ObjectId(),
//         message: message,
//         from: user?._id,
//         to: friend?._id,
//         conversation: e["conversation_id"]
//       });
//       e["messages"].push(msg);
//     }
//   });
//   friendConv?.conversation.forEach(e => {
//     if(e["friend"].toString() === friendId && e["user"].toString() === userId) {
//       const msg = Message.create({
//         _id: new mongoose.Types.ObjectId(),
//         message: message,
//         from: user?._id,
//         to: friend?._id,
//         conversation: e["conversation_id"]
//       });
//       e["messages"].push(msg);
//     }
//   });
// }
const addMessage = (userId, friendId, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield conversations_1.default.findOne({ user: userId, friend: friendId })
        .populate({
        strictPopulate: false,
        path: "messages",
        model: 'Message'
    }).exec().then((r) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield messages_1.default.create({
            message: message,
            from: new mongoose_1.default.Types.ObjectId(userId),
            to: new mongoose_1.default.Types.ObjectId(friendId),
            conversation: new mongoose_1.default.Types.ObjectId()
        }).then((m) => __awaiter(void 0, void 0, void 0, function* () {
            (yield m).save();
            //r.messages = [...r.messages, m];
            console.log('first');
            r.messages.push(m);
            (yield r).save();
        }));
    }));
    yield conversations_1.default.findOne({ user: friendId, friend: userId })
        .populate({
        strictPopulate: false,
        path: "messages",
        model: 'Message'
    }).exec().then((r) => __awaiter(void 0, void 0, void 0, function* () {
        const msg = yield messages_1.default.create({
            message: message,
            from: new mongoose_1.default.Types.ObjectId(userId),
            to: new mongoose_1.default.Types.ObjectId(friendId),
            conversation: new mongoose_1.default.Types.ObjectId()
        }).then((m) => __awaiter(void 0, void 0, void 0, function* () {
            (yield m).save();
            r.messages.push(m);
            console.log('second');
            (yield r).save();
        }));
    }));
});
exports.addMessage = addMessage;

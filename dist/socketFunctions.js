"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getU = exports.getUserSocket = exports.getUser = exports.removeUser = exports.addUser = void 0;
let users = [];
const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
        !users.some(user => user.socketId === socketId) &&
        users.push({ userId, socketId });
};
exports.addUser = addUser;
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};
exports.removeUser = removeUser;
const getUser = (userId) => {
    return users.find(user => user.userId === userId);
};
exports.getUser = getUser;
const getUserSocket = (userId) => {
    return users.find(user => user.userId === userId)["socketId"];
};
exports.getUserSocket = getUserSocket;
const getU = (socketId) => {
    return users.find(user => user.socketId === socketId);
};
exports.getU = getU;

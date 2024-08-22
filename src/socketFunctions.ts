import jwt from 'jsonwebtoken';


let users:any = [];



export const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
    !users.some(user => user.socketId === socketId) &&
    users.push({userId, socketId});
}

export const removeUser = (socketId:string) => {
    users = users.filter(user => user.socketId !== socketId);
}

export const getUser = (userId:string) => {
    return users.find(user => user.userId === userId);
}

export const getUserSocket = (userId:string) => {
    let user = users.find(user => user.userId === userId);
    if(user) {
        return user["socketId"];
    }

}

export const getU = (socketId:string) => {
    return users.find(user => user.socketId === socketId);
}


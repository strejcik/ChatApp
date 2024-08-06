import {createContext} from 'react';
import socketIO, {Socket} from 'socket.io-client';
import Cookies from 'js-cookie';
let t = Cookies.get('token');


interface socketContextInterface {
    socket: any;
  }


const authContext = createContext<socketContextInterface>({
    socket: Socket
});

export default authContext;



export const socket = socketIO('http://localhost:5000',{secure: true, autoConnect: false});


export const SocketContext = createContext<Socket>(socket);


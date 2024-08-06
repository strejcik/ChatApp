import React, {useEffect} from 'react';

import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import MyMessages from '../../components/MyMessages';
import {SocketContext} from '../../context/socketContext';
import authContext from "../../context/authContext";
import authCheck from '../../services/auth/authCheck';
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';


const ChatPage = () => {
    let t = Cookies.get('token');
    const socket = React.useContext(SocketContext);
    const {auth, setAuth} = React.useContext(authContext);
    const navigate = useNavigate();

    useEffect(() => {
        authCheck(navigate, setAuth);
    },[auth, socket]);

    React.useEffect(() => {

        socket.auth = {
            token:t
        }
        socket.connect();
           
    
        return () => {
          socket.disconnect();
        };
      }, [t, socket]);
      //disableTransitionOnChange
    return (
        <>
                <CssVarsProvider disableTransitionOnChange>
                <CssBaseline />
                <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
                    {/* <Sidebar /> */}
                    <Header />
                    <Box component="main" className="MainContent" sx={{ flex: 1 }}>
                    <MyMessages />
                    </Box>
                </Box>
                </CssVarsProvider>
        </>
    );
};

export default ChatPage;
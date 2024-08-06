import React, { useState, useContext } from 'react';
import { Route, createBrowserRouter, createHashRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom';

import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MyMessages from './components/MyMessages';



import LoginUserPage from './pages/LoginUserPage/LoginUserPage';
import RegisterUserPage from './pages/RegisterUserPage/registerUserPage';
import NoMatchPage from './pages/NoMatchPage/NoMatchPage';
import ChatPage from 'pages/ChatPage/ChatPage';
import Root from './components/Root';

import AuthContext from './context/authContext';
import {SocketContext, socket} from './context/socketContext';
import idContext from './context/getMyIdContext';
import messagesContext from 'context/messagesContext';




const App = () => {
  const [auth, setAuth] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [myId, setMyId] = useState('');
  const [messages, setMessages] = useState(['']);

  const router = createHashRouter(
    createRoutesFromElements(
      <Route path='/' element={<Root/>}>
        <Route path='login' element={<LoginUserPage />} />
        <Route path='register' element={<RegisterUserPage />} />
        <Route path='chat' element={<ChatPage/>} />
          {/* <Route path='panel' element={<UserPanelPage />}>
              <Route path="addlink" element={<AddLink />} />
              <Route path="managelink" element={<ManageLink />}/>
              <Route path="managelink/edit/:id" element={<EditLinkItem />} />
              <Route path="linkviews" element={<LinkViewsPage />} />
          </Route> */}
        <Route path="*" element={<NoMatchPage />} />
      </Route>
    )
  )
  //socket.emit("addUser", "66a46ae5224a5b8aec922f3d"); done
  //socket.emit("getFriends","66a4a2e39ca67f40b80a8875") done
  return (
    <AuthContext.Provider value={{ auth, setAuth, setAccountCreated, accountCreated}}>
      <SocketContext.Provider value={socket}>
        <idContext.Provider value={{myId, setMyId}}>
          <messagesContext.Provider value={{messages, setMessages}}>
              <RouterProvider router={router} />
          </messagesContext.Provider>
            
        </idContext.Provider>
      </SocketContext.Provider>
    </AuthContext.Provider>


    





  )
};

export default App;


{/* <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        <Sidebar />
        <Header />
        <Box component="main" className="MainContent" sx={{ flex: 1 }}>
          <MyMessages />
        </Box>
      </Box>
    </CssVarsProvider> */}
import * as React from 'react';
import { useContext } from 'react';
import Sheet from '@mui/joy/Sheet';

import MessagesPane from './MessagesPane';
import ChatsPane from './ChatsPane';
import { ChatProps } from '../types';
import { chats } from '../data';
import {SocketContext} from '../context/socketContext';
import idContext from '../context/getMyIdContext';
import messagesContext from 'context/messagesContext';

function dynamicSort(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  return function (a,b) {
      /* next line works with strings and numbers, 
       * and you may want to customize it to your needs
       */
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
  }
}
export default function MyProfile() {
  const socket = useContext(SocketContext);
  const {messages, setMessages} = useContext(messagesContext);
  const [selectedChat, setSelectedChat] = React.useState(messages[0]);
  const [isFetched, setIsFetched] = React.useState<boolean>(false);
  const [isDataPrepared, setIsDataPrepared] = React.useState<boolean>(false);
  const {myId, setMyId} = useContext(idContext);
  const [friendId, setFriendId] = React.useState<string>();
  const [userSender, setUserSender] = React.useState<any>();
  const [enableConversationFetching, setIsConversationFetched] = React.useState<boolean>(false);
  const [toggle, setToggle] = React.useState(true);
  const [refresh, setRefresh] = React.useState(false);
  const [convId, setConvId] = React.useState<number>();
  const [convData, setConvData] = React.useState(messages[0]);

  // React.useEffect(() => {
  //   setIsFetched(false);
  //   const refreshHandler = (r) => {
  //     setIsFetched(false);
  //     if(myId){
  //       socket.emit("getConversations", myId);
  //     } 
      
  //   }
  //   const convHandler = (r) => {
  //     setMessages([...r]);
  //     setIsFetched(true);
  //   }
  //   if(myId) {
  //     socket.emit("getConversations", myId); 
  //     socket.on("getConversations", convHandler);
  //     socket.on("refreshMessages", refreshHandler);
  //   }
  //   return () => {
  //     socket.off("getConversations",convHandler);
  //     socket.off("refreshMessages", refreshHandler);
  //   };
  // }, [socket, myId]);


















  
  
  


  React.useEffect(() => {
    // let getFriend = {
    //   userId: "66a52413afa4f648b898c0f4",
    //   // friendId: "66a5241cafa4f648b898c0f7",
    //   // message: "sample2",
    //   // conversationId: "d5676e64-3331-4529-a41b-8e74cad34fcc"
    // }
    //socket.emit("getConversations", getFriend);
    //socket.emit("populateUser", getFriend.userId);
    const idHandler = (r) => {
      setMyId(r)
    }
    socket.emit("getMyId");
    socket.on("getMyId", idHandler);
    return () => {
      socket.off("getMyId",idHandler);
    };
  }, [socket])


const prepareContactList = (r) => {

  let tempObj:any = {
    id:'',
    sender:'',
    messages:[]
};

let tempArr:any = [];
let tmpObj;

r.forEach(e => {
  tmpObj = {
    id: e.conversation_id,
    messages: [],
    sender: e.friend
  }
  setUserSender(e.user);
  tempArr.push(tmpObj);
  tempObj = {
    id:'',
    sender:'',
    messages:[]
  }
});


  setMessages(tempArr)
  setSelectedChat(tempArr);
  setIsDataPrepared(true);
}












function prepareConvMessages(r){
  let tempObj:any = {
    id:'',
    sender:'',
    messages:[]
};
let tempObj2= {
    id: '',
    content:'',
    timestamp:'',
    sender:'',
    unread: false
};
let tempArr:any = [];
let tmpObj;

r.forEach(e => {
  if(e.messages.length === 0) {
    tmpObj = {
      id: e.conversation_id,
      messages: [],
      sender: e.friend
    }
    setUserSender(e.user);
    tempArr.push(tmpObj);
  }
});
r.forEach(e => {
  if(e.messages.length > 0) {
    setUserSender(e.user);
    tempObj.id = e.conversation_id;
    e.messages.forEach(x => {
      tempObj2.id = x._id;
      tempObj2.content = x.message;
      tempObj2.timestamp = x.timestamp;
      tempObj2.sender = x.from;
      if(x.to?._id === myId) {
        tempObj.sender = x.from;
      } else {
        tempObj.sender = x.to
      }
      tempObj2.unread = false;
      tempObj.messages.push(tempObj2);
      tempObj2 = { id: '',
        content:'',
        timestamp:'',
        sender:'',
        unread: false};
    })
    
  }
  tempArr.push(tempObj);
  tempObj = {
    id:'',
    sender:'',
    messages:[]
  }
});




console.log('TEMP ARRRRRR', tempArr);


let tempSelChat:any = [];
console.log('before', tempSelChat);
for(let i = 0; i < tempArr.length; i++) {
  if(selectedChat[i].id === tempArr[i].id) {
    tempSelChat = [tempArr[i]];
  }
}

  
tempArr.sort(dynamicSort("id"));


for(let i = 0; i < messages.length; i++) {
  if(tempSelChat.length !== 0 && messages.length !== 0) {
    if(tempSelChat[0].id !== messages[i].id) {

      tempArr.push(messages[i]);
      tempArr.sort(dynamicSort("id"));
    }
  } else {
    tempSelChat.push([tempArr[i]])
  }
}


tempArr.sort(dynamicSort("id"));
setMessages(tempArr);
setSelectedChat(tempSelChat);


}

const rfrsh = ({message: r, user}) => {

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}


const newId = uuidv4();
const newIdString = newId.toString();
let fndMsg =  messages.find(e => e.sender._id === user);
let restMsgs = messages.find(e => e.sender._id !== user);
let result:any = [];
fndMsg.messages.push({
  id: newIdString,
  sender:fndMsg.sender,
  content: r,
  timestamp: formatDate(new Date),
});


result.push(fndMsg);
if(restMsgs !== undefined) result.push(restMsgs);
result.sort(dynamicSort("id"));

setSelectedChat(result);
setMessages(result);


}



React.useEffect(() => {

  const refreshHandler = (r) => {
    rfrsh(r);
  }
socket.on("refreshMessages", refreshHandler);
  return () => {
    socket.off("refreshMessages", refreshHandler);
  };
}, [socket, selectedChat, messages]);





React.useEffect(() => {
  const convHandler = (r) => {
    prepareConvMessages(r);
  }
  if(myId && (toggle === true || toggle === false)) {
    let currentChatId = messages.find(e => e.id === selectedChat[0].id).id;
    let userObj = {
      userId: myId,
      conversation_id: currentChatId,
    }
    socket.emit("getConversation", userObj); 
    socket.on("getConversation", convHandler);
  }
  return () => {
    socket.off("getConversation",convHandler);
  };
}, [toggle]);














// React.useEffect(() => {

//   if(myId) {
//     console.log('inside');
//     rfrsh(convData);
//   }
//   return () => {
//     setRefresh(false);
//   };
// }, [refresh]);
















  React.useEffect(() => {
    setIsFetched(false);
    const contactHandler = (r) => {
      console.log(r);
      prepareContactList(r);
      setIsFetched(true);
      
    }
    if(myId) {
      socket.emit("getContactList", myId);
      socket.on("getContactList", contactHandler);
    }
    return () => {
      socket.off("getContactList",contactHandler);
    };
  }, [myId]);













  // React.useEffect(() => {

  //   if(enableConversationFetching) {

  //     prepareConvMessages();
     
  //   }
  // }, [enableConversationFetching]);

  const isMessagesPaneReady = selectedChat.length !== 0 && isDataPrepared && friendId? selectedChat[0] : [];
  return (
    <Sheet
      sx={{
        flex: 1,
        width: '100%',
        mx: 'auto',
        pt: { xs: 'var(--Header-height)', sm: 0 },
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(min-content, min(30%, 400px)) 1fr',
        },
      }}
    >
      <Sheet
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          transform: {
            xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
            sm: 'none',
          },
          transition: 'transform 0.4s, width 0.4s',
          zIndex: 100,
          width: '100%',
          top: 52,
        }}
      >
        {
          isFetched && isDataPrepared && <ChatsPane
          chats={messages}
          selectedChatId={selectedChat[0].id}
          setSelectedChat={setSelectedChat}
          setFriendId={setFriendId}
          friendId={friendId}
          enableConversationFetching = {enableConversationFetching}
          setIsConversationFetched={setIsConversationFetched}
          setToggle={setToggle}
          toggle={toggle}
        />
        }
      </Sheet>
      {
        <MessagesPane chat={isMessagesPaneReady} userSender={userSender} friendId={friendId} isFetched={isFetched} isDataPrepared={isDataPrepared} selectedChat={selectedChat.length !== 0}/>
      }
    </Sheet>
  );
}

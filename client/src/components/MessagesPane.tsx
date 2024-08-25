import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import AvatarWithStatus from './AvatarWithStatus';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { ChatProps, MessageProps } from '../types';
import idContext from '../context/getMyIdContext';
import messagesContext from 'context/messagesContext';
import {SocketContext} from '../context/socketContext';

// type MessagesPaneProps = {
//   chat: ChatProps;
// };

export default function MessagesPane(props) {
  let msgs:any = [];
  const {
    chat, 
    userSender, 
    friendId, 
    isFetched, 
    isDataPrepared, 
    selectedChat, 
    prepareConvMessagesAndReverse, 
    encryptAndSendMessage,
    getSessionCipherForRecipient,
    sendMessage,
    adiStore,
    brunhildeStore,
  } = props;
  const {messages, setMessages} = React.useContext(messagesContext);
  messages[0]?.messages === undefined ? msgs.push({}) : msgs.push(...messages[0]?.messages);
  const [chatMessages, setChatMessages] = React.useState(chat);
  const [textAreaValue, setTextAreaValue] = React.useState('');
  const {myId} = React.useContext(idContext);
  const socket = React.useContext(SocketContext);
  
  
  
  const scrollableDivRef:any = React.useRef<HTMLInputElement>(null);
  const [page, setPage] = React.useState(1);
  const [loadingMsgs, setLoadingMsgs] = React.useState(false);










  


  const fetchMessages = React.useCallback((page) => {
    const chunkHandler = (r) => {
      prepareConvMessagesAndReverse(r)
      setLoadingMsgs(false);
    }
    if(isFetched && isDataPrepared && selectedChat && friendId && myId && page >= 2) {
      console.log('INSINSINSISNIS');
      setLoadingMsgs(true);
      let obj = {
        page: page,
        userId: myId,
        conversation_id: chat.id
      };
      console.log(chat);
      socket.emit("getChunkOfConversation", obj);
      socket.on("getChunkOfConversation",chunkHandler);


    }
    return () => {
      socket.off("getChunkOfConversation",chunkHandler);
    };

    
  }, [myId, chat]);

  React.useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  const handleScroll = () => {
    const div = scrollableDivRef.current;
    console.log('ScrollHeight', div.scrollHeight);
    console.log('ScrollTop', div.scrollTop);
    console.log('ClientHeight', div.clientHeight);
    if (div.scrollHeight + div.scrollTop <= div.clientHeight+1 && !loadingMsgs) {
      setPage(prevPage => prevPage + 1);
      console.log('NOW');
      div.scrollTop += 50;
      
    }
    if(div.scrollTop === 0) {
      
      if(page > 1) {
        setPage(prevPage => prevPage - 1);
        div.scrollTop -= 1;
      }
    }
  };




  React.useEffect(() => {
    setChatMessages(chatMessages);
  }, [chatMessages]);
  return (
    <Sheet
      sx={{
        height: { xs: 'calc(100dvh - var(--Header-height))', sm: '100dvh', lg: '100dvh' },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.level1',
      }}
    >
      {isFetched && isDataPrepared && selectedChat && friendId && <MessagesPaneHeader sender={chat?.sender} /> }
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          px: 2,
          py: 3,
          overflowY: 'scroll',
          flexDirection: 'column-reverse',
          
        }}
        ref={scrollableDivRef}
        onScroll={handleScroll}
      >
        <Stack spacing={2} justifyContent="flex-end">
          {isFetched && isDataPrepared && selectedChat && friendId && (chat.length !== 0) ? chat.messages?.map((message, index: number) => {
            let isYou;
            if(message.sender?._id !== myId){ isYou = 'You'}
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                flexDirection={isYou ? 'row-reverse' : 'row'}
              >
                {isYou !== 'You' && (
                  <AvatarWithStatus
                    online={message.sender.online}
                    src={message.sender.avatar}
                  />
                )}
                <ChatBubble variant={isYou ? 'sent' : 'received'} {...message} isYou={isYou}/>
              </Stack>
            );
          }) : <></>}
        </Stack>
      </Box>
      {isFetched && isDataPrepared && friendId && <MessageInput
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        onSubmit={async() => {


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


          const newId = chatMessages?.length + 1;
          const newIdString = newId.toString();
          setChatMessages([
            ...chat.messages,
            chat.messages.push({
              id: newIdString,
              sender:userSender,
              content: textAreaValue,
              timestamp: formatDate(new Date),
            }),
          ]);
            let obj = {
              userId:userSender._id,
              friendId:friendId,
              message:textAreaValue
            }
            // const sendTo = friendId;
            // const to = sendTo === myId? friendId : myId;
            //const from = to === "adalheid" ? "brünhild" : "adalheid";
            const to = friendId === "66bb6e066d22021443d8b064" ? "brünhild" : "adalheid";
            console.log(to);
            //addMessageToSession(to, obj.message);
            const cipher = getSessionCipherForRecipient(to);
            const ciphertext = await cipher.encrypt(
              new TextEncoder().encode(obj.message).buffer
            );
            obj.message = ciphertext;
            //addMessageToSession(to, ciphertext);
            //sendMessage(myId, friendId, obj.message)
            socket.emit("sAddMessage", obj);

        }}
      />}
    </Sheet>
  );
}
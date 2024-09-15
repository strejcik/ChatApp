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
import HasChanged from './HasChanged';

import {
  SignedPublicPreKeyType,
  SignalProtocolAddress,
  SessionBuilder,
  PreKeyType,
  SessionCipher,
  MessageType,
} from "@privacyresearch/libsignal-protocol-typescript";
import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory } from "./signal-directory";

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


// interface ChatMessage {
//   id: number;
//   to: string;
//   from: string;
//   message: MessageType;
//   delivered: boolean;
// }
// interface ProcessedChatMessage {
//   id: number;
//   to: string;
//   from: string;
//   messageText: string;
// }
let msgID = 0;

function getNewMessageID(): number {
  return msgID++;
}




const adalheidAddress = new SignalProtocolAddress("adalheid", 1);
const brunhildeAddress = new SignalProtocolAddress("brünhild", 1);
let MyProfile;
export default MyProfile =  () => {
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

  const [isDataFetched, setIsDataFetched] = React.useState<any>();

  const [myIdentity,setMyIdentity] = React.useState({});
  const [aldOrBrun, setAldOrBrun] = React.useState('');
  const [processed, isProcessed] = React.useState(false);
  const [adiStore, setAdiStore] = React.useState(new SignalProtocolStore());
  const [brunhildeStore, setBrunhildeStore] = React.useState(new SignalProtocolStore());


  const [aHasIdentity, setAHasIdentity] = React.useState(false);
  const [bHasIdentity, setBHasIdentity] = React.useState(false);





  const [directory] = React.useState(new SignalDirectory());
  const [messagesx, setMessagesx] = React.useState<any>([]);
  const [processedMessages, setProcessedMessages] = React.useState<any>([]);

  const [hasSession, setHasSession] = React.useState(false);





  const readMessage = async (msg, cipher: SessionCipher) => {
    let plaintext: ArrayBuffer = new Uint8Array().buffer;
    if (msg.type === 3) {
      plaintext = await cipher.decryptPreKeyWhisperMessage(
        msg.body!,
        "binary"
      );
      setHasSession(true);
    } else if (msg.type === 1) {
      plaintext = await cipher.decryptWhisperMessage(
        msg.body!,
        "binary"
      );
    }
    const stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
    console.log(stringPlaintext);

    const { id, to, from } = msg;
    return { id, to, from, messageText: stringPlaintext };
  };

  const storeSomewhereSafe = (store: SignalProtocolStore) => (
    key: string,
    value: any
  ) => {
    store.put(key, value);
  };

  const createID = async (name: string, store: SignalProtocolStore, r) => {
    const registrationId = 2;
    storeSomewhereSafe(store)(`registrationID`, registrationId);
    const {
      baseKeyId,
      identityKeyPair,
      preKey,
      signedPreKeyId,
      signedPreKey } = r;

    

    storeSomewhereSafe(store)("identityKey", identityKeyPair);

    store.storePreKey(`${baseKeyId}`, preKey.keyPair);

    store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
    const publicSignedPreKey: SignedPublicPreKeyType = {
      keyId: signedPreKeyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
    };
    // Now we register this with the server so all users can see them
    const publicPreKey: PreKeyType = {
      keyId: preKey.keyId,
      publicKey: preKey.keyPair.pubKey,
    };
    directory.storeKeyBundle(name, {
      registrationId,
      identityPubKey: identityKeyPair.pubKey,
      signedPreKey: publicSignedPreKey,
      oneTimePreKeys: [publicPreKey],
    });
    
  };

  const createAdalheidIdentity = async (r) => {
    // adiStore.remove("adalheid");
    // adiStore.removeAllSessions("adalheid")
    // directory.rm("adalheid")
    await createID("adalheid", adiStore, r);
    ///console.log({ adiStore });
    setAHasIdentity(true);
  };

  const createBrunhildeIdentity = async (r) => {
    // brunhildeStore.remove("brünhild");
    // brunhildeStore.removeAllSessions("brünhild");
    // directory.rm("brünhild")
    await createID("brünhild", brunhildeStore, r);
    setBHasIdentity(true);
  };


  const startSessionWithBrunhilde = async () => {
    // get Brünhild' key bundle
    const brunhildeBundle = directory.getPreKeyBundle("brünhild");
    //console.log({ brunhildeBundle });

    const recipientAddress = brunhildeAddress;

    // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
    const sessionBuilder = new SessionBuilder(adiStore, recipientAddress);
    //console.log("adalheid processing prekey");
    await sessionBuilder.processPreKey(brunhildeBundle!);
  };

  const startSessionWithAdalheid = async () => {
    // get Adalheid's key bundle
    const adalheidBundle = directory.getPreKeyBundle("adalheid");
    //console.log({ adalheidBundle });

    const recipientAddress = adalheidAddress;

    // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
    const sessionBuilder = new SessionBuilder(brunhildeStore, recipientAddress);

    // Process a prekey fetched from the server. Returns a promise that resolves
    // once a session is created and saved in the store, or rejects if the
    // identityKey differs from a previously seen identity for this address.
    //console.log("brünhild processing prekey");
    await sessionBuilder.processPreKey(adalheidBundle!);
  };



const getSessionCipherForRecipient = (to: string) => {
  // send from Brünhild to myId so use his store
  const store = to === myId ? brunhildeStore : adiStore;
  const address = to === myId ? adalheidAddress : brunhildeAddress;
  return new SessionCipher(store, address);
};


const getReceivingSessionCipherForRecipient = (to: string) => {
  // send from Brünhild to Adalheid so use his store
  const store = to === "brünhild" ? brunhildeStore : adiStore;
  const address = to === "brünhild" ? adalheidAddress : brunhildeAddress;
  return new SessionCipher(store, address);
};



const doProcessing = async (ta) => {
  console.log(ta[0].messages);
  let m = ta[0].messages.forEach(async e => {
    let cipher = await getReceivingSessionCipherForRecipient("brünhild");
    let msg = await readMessage(e.content, cipher);
    e.content = msg.messageText;
  });
  return m;
};









React.useEffect(() => {
  const sidHand = async(rsp) => {
    setMyIdentity(rsp);
  }
  if(hasSession || !(aHasIdentity && bHasIdentity)) {
    if(myId) {
      socket.emit("sxGetMyId");
      socket.on("sxGetMyId",sidHand);
    }

  }
  return () => {
    socket.off("sxGetMyId",sidHand);
  };
}, [myId]);






  React.useEffect(() => {
  const idHand = async(r) => {
    if(myIdentity) {
      if(myIdentity["baseKeyId"] < r.baseKeyId) {
        setAldOrBrun('adalheid');
        await createAdalheidIdentity(myIdentity); 
        await createBrunhildeIdentity(r);
        let currentChat = messages.find(e => e?.id === selectedChat[0]?.id);
        if(currentChat.messages.length === 0 && isDataFetched) {
          await startSessionWithBrunhilde();
        }
      }
      if(myIdentity["baseKeyId"] > r.baseKeyId){
        setAldOrBrun('brünhild');
        
        await createAdalheidIdentity(r);
        await createBrunhildeIdentity(myIdentity);
        let currentChat = messages.find(e => e?.id === selectedChat[0]?.id);
        if(currentChat.messages.length === 0  && isDataFetched) {
          await startSessionWithBrunhilde();
        }
      }
    }
    
  }
  if(friendId) {
    socket.emit("sGetFriendId",friendId);
    socket.on("sGetFriendId", idHand);
  }
  return () => {
    socket.off("sGetFriendId",idHand);
  };
}, [friendId, isDataFetched, messages])



  
  
  


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








async function prepareConvMessagesAndReverse(r) {
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
    tempArr.push(tempObj);
    tempObj = {
      id:'',
      sender:'',
      messages:[]
    }
  }

});


const doProcessing = async (arr) => {
  arr.forEach(async e => {
    e.messages.forEach(async x => {
      if(x.content.type) {
        


      startSessionWithBrunhilde();
  

      let cipher = await getReceivingSessionCipherForRecipient("brünhild");
      let plaintext: ArrayBuffer = new Uint8Array().buffer;
      if ( x.content.type === 3) {
        plaintext = await cipher.decryptPreKeyWhisperMessage(
          x.content.body!,
          "binary"
        );


      } else if (x.content.type === 1) {
        plaintext = await cipher.decryptWhisperMessage(
          x.content.body!,
          "binary"
        );
      }

      let stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
      x.content = stringPlaintext;
      }

    })
  
  })
  return arr;
}
if(typeof tempArr[0].messages[0].content !== 'string') {
  await doProcessing(tempArr).then(r => {
    console.log(tempArr);
    console.log(r);
    //tempArr = r;
    let tempSelChat:any = [];
    for(let i = 0; i < r.length; i++) {
      if(selectedChat[i].id === r[i].id) {
        tempSelChat = [r[i]];
      }
    }
    
      
    r.sort(dynamicSort("id"));
    
    
    for(let i = 0; i < messages.length; i++) {
      if(tempSelChat.length !== 0 && messages.length !== 0) {
        if(tempSelChat[0].id !== messages[i].id) {
    
          r.push(messages[i]);
          r.sort(dynamicSort("id"));
        }
      } else {
        tempSelChat.push([r[i]])
      }
    }
    
      r.sort(dynamicSort("id"));
    
      let currChat = messages.find(e => e.id === tempSelChat[0].id);
      let currTempArr = r.find(e => e.id === tempSelChat[0].id);
      
      
      if(currChat) currChat.messages = currTempArr.messages;
  })
}





}



async function prepareConvMessages(r){

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
    tempArr.push(tempObj);
  }

  tempObj = {
    id:'',
    sender:'',
    messages:[]
  }
});


const doProcessing = async (arr) => {
  arr.forEach(async e => {
    e.messages.forEach(async x => {


      
      if(x.content.type) {
        startSessionWithBrunhilde();
        

      let cipher = await getReceivingSessionCipherForRecipient("brünhild");
      let plaintext: ArrayBuffer = new Uint8Array().buffer;
      if ( x.content.type === 3) {
        plaintext = await cipher.decryptPreKeyWhisperMessage(
          x.content.body!,
          "binary"
        );


      } else if (x.content.type === 1) {
        plaintext = await cipher.decryptWhisperMessage(
          x.content.body!,
          "binary"
        );
      }

      let stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
      x.content = stringPlaintext;
      x.processed = true;

      brunhildeStore.removeAllSessions("brünhild");
      adiStore.removeAllSessions("adiStore");
      }

    })
  
  })
  return arr;
}





  await doProcessing(tempArr).then((s) => {
    isProcessed(true);
    let tempSelChat:any = [];
    for(let i = 0; i < s.length; i++) {
      if(selectedChat[0].id === s[i].id) {
        tempSelChat = [s[i]];
      }
    }
      
    s.sort(dynamicSort("id"));
    
    for(let i = 0; i < messages.length; i++) {
      if(tempSelChat.length !== 0 && messages.length !== 0) {
        if(tempSelChat[0].id !== messages[i].id) {
    
          s.push(messages[i]);
          s.sort(dynamicSort("id"));
        }
      } else {
        tempSelChat.push([s[i]])
      }
    }
    
    s.sort(dynamicSort("id"));
    setMessages(s);
    setSelectedChat(tempSelChat);
    setProcessedMessages(s);
    setIsDataFetched(true);
  })








}

const rfrsh = async({message: r, user}) => {

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
  console.log(messages);
  let fndMsg =  messages.find(e => e.sender._id === user);
  let restMsgs = messages.find(e => e.sender._id !== user);
  let result:any = [];
  
  
  const doProcessing = async(z) => {
        startSessionWithBrunhilde();
    
  
        let cipher = await getReceivingSessionCipherForRecipient("brünhild");
        let plaintext: ArrayBuffer = new Uint8Array().buffer;
        if ( z.type === 3) {
          plaintext = await cipher.decryptPreKeyWhisperMessage(
            z.body!,
            "binary"
          );
  
  
        } else if (z.type === 1) {
          plaintext = await cipher.decryptWhisperMessage(
            z.body!,
            "binary"
          );
        }
  
        let stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
        z = stringPlaintext;
  
        return z;
  }
  
  
  
  await doProcessing(r).then(s => {
    fndMsg.messages.push({
      id: newIdString,
      sender:fndMsg.sender,
      content: s,
      timestamp: formatDate(new Date),
    });
    
    
    result.push(fndMsg);
    if(restMsgs !== undefined) result.push(restMsgs);
    result.sort(dynamicSort("id"));
    
    //setSelectedChat(result);
    
    
    setMessages(result);
  })
  
  
  }



React.useEffect(() => {

  const refreshHandler = (r) => {
    if(aldOrBrun !== '' && r.user===friendId)
      rfrsh(r);
  }
socket.on("refreshMessages", refreshHandler);
  return () => {
    socket.off("refreshMessages", refreshHandler);
  };
}, [socket, selectedChat, messages]);


React.useEffect(() => {
  const convHandler = (r) => {
      setIsDataFetched(false);
      prepareConvMessages(r);
  }
  if(myId && (toggle === true || toggle === false) && processed === false) {
    let currentChatId = messages.find(e => e?.id === selectedChat[0]?.id)?.id;
    let userObj = {
      userId: myId,
      conversation_id: currentChatId,
    }
    messages.forEach(e => e.messages.forEach(s =>{
      if(s.processed === true){
        setProcessedMessages(messages);
        return;
      }
    }))
    socket.emit("getConversation", userObj); 
    socket.on("getConversation", convHandler);
  }
  return () => {
    socket.off("getConversation",convHandler);
  };
}, [toggle, processed]);




  React.useEffect(() => {
    setIsFetched(false);
    const contactHandler = (r) => {
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
          chats={processedMessages.length > 0 ? processedMessages : messages}
          selectedChatId={selectedChat[0]?.id}
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
        <MessagesPane chat={isMessagesPaneReady} userSender={userSender} friendId={friendId} isFetched={isFetched} isDataPrepared={isDataPrepared} selectedChat={selectedChat.length !== 0} setUserSender={setUserSender} prepareConvMessagesAndReverse={prepareConvMessagesAndReverse}         adiStore={adiStore}
        brunhildeStore={brunhildeStore} aldOrBrun={aldOrBrun} getSessionCipherForRecipient={getSessionCipherForRecipient}/>
      }
      <HasChanged prop1={selectedChat[0]?.id} prop2={isProcessed} prop3={processedMessages}/>
    </Sheet>
  );
}

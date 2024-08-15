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

















import {
  KeyHelper,
  SignedPublicPreKeyType,
  SignalProtocolAddress,
  SessionBuilder,
  PreKeyType,
  SessionCipher,
  MessageType,
} from "@privacyresearch/libsignal-protocol-typescript";


import { SignalProtocolStore } from "./storage-type";
import { SignalDirectory } from "./signal-directory";



interface ChatMessage {
  id: number;
  to: string;
  from: string;
  message: MessageType;
  delivered: boolean;
}
interface ProcessedChatMessage {
  id: number;
  to: string;
  from: string;
  messageText: string;
}
let msgID = 0;

function getNewMessageID(): number {
  return msgID++;
}

const adalheidAddress = new SignalProtocolAddress("adalheid", 1);
const brunhildeAddress = new SignalProtocolAddress("brünhild", 1);






































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
  const [mySigObjId, setMySigObjId] = React.useState("");
  const [adiStore] = React.useState(new SignalProtocolStore());
  const [brunhildeStore] = React.useState(new SignalProtocolStore());


  const [aHasIdentity, setAHasIdentity] = React.useState(false);
  const [bHasIdentity, setBHasIdentity] = React.useState(false);





  const [directory] = React.useState(new SignalDirectory());
  const [messagesx, setMessagesx] = React.useState<ChatMessage[]>([]);
  const [processedMessages, setProcessedMessages] = React.useState<
    ProcessedChatMessage[]
  >([]);

  const [hasSession, setHasSession] = React.useState(false);

  const [adalheidTyping, setAdalheidTyping] = React.useState("");
  const [brunhildeTyping, setBrunhildeTyping] = React.useState("");

  const [processing, setProcessing] = React.useState(false);

  const sendMessage = (to: string, from: string, message: MessageType) => {
    const msg = { to, from, message, delivered: false, id: getNewMessageID() };
    setMessagesx([...messagesx, msg]);
  };




  React.useEffect(() => {
    if (!messagesx.find((m) => !m.delivered) || processing) {
      return;
    }

    const getReceivingSessionCipherForRecipient = (to: string) => {
      // send from Brünhild to Adalheid so use his store
      const store = to === "brünhild" ? brunhildeStore : adiStore;
      const address = to === "brünhild" ? adalheidAddress : brunhildeAddress;
      return new SessionCipher(store, address);
    };

    const doProcessing = async () => {
      while (messagesx.length > 0) {
        const nextMsg = messagesx.shift();
        if (!nextMsg) {
          continue;
        }
        const cipher = getReceivingSessionCipherForRecipient(nextMsg.to);
        const processed = await readMessage(nextMsg, cipher);
        processedMessages.push(processed);
      }
      setMessagesx([...messagesx]);
      setProcessedMessages([...processedMessages]);
    };
    setProcessing(true);
    doProcessing().then(() => {
      setProcessing(false);
    });
  }, [adiStore, brunhildeStore, messagesx, processedMessages, processing]);


  const readMessage = async (msg: ChatMessage, cipher: SessionCipher) => {
    let plaintext: ArrayBuffer = new Uint8Array().buffer;
    if (msg.message.type === 3) {
      console.log({ msg });
      plaintext = await cipher.decryptPreKeyWhisperMessage(
        msg.message.body!,
        "binary"
      );
      setHasSession(true);
    } else if (msg.message.type === 1) {
      plaintext = await cipher.decryptWhisperMessage(
        msg.message.body!,
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



    let createIdObj:any = r;
    const registrationId = KeyHelper.generateRegistrationId();
    storeSomewhereSafe(store)(`registrationID`, registrationId);
    const {
      bki,
      ikp,
      pk,
      spki,
      spk } = createIdObj;

    let baseKeyId = bki;
    let identityKeyPair = ikp;
    identityKeyPair.pubKey = identityKeyPair.pbk
    identityKeyPair.privKey = identityKeyPair.prk
    identityKeyPair.pbk = "";
    identityKeyPair.prk = "";
    let preKey = pk;
    preKey.keyId = preKey.ki;
    preKey.keyPair = preKey.kp;
    preKey.keyPair.pubKey = preKey.keyPair.pbk;
    preKey.keyPair.privKey = preKey.keyPair.prk; 
    preKey.ki = "";
    preKey.kp = "";
    preKey.keyPair.pbk = "";
    preKey.keyPair.prk = "";

    let signedPreKeyId = spki;
    let signedPreKey = spk;
    signedPreKey.keyPair = spk.kp;
    signedPreKey.keyPair.pubKey = spk.kp.pbk;
    signedPreKey.keyPair.privKey = spk.kp.prk;
    signedPreKey.keyId = spk.ki;
    signedPreKey.signature = spk.si;
    spk.kp = "";
    spk.ki = "";
    spk.si = "";

    

    storeSomewhereSafe(store)("identityKey", identityKeyPair);

    console.log('STORE', store);

    store.storePreKey(`${baseKeyId}`, preKey.keyPair);
    store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
    const publicSignedPreKey: SignedPublicPreKeyType = {
      keyId: signedPreKeyId,
      publicKey: signedPreKey.keyPair.pubKey,
      signature: signedPreKey.signature,
    };


    const publicPreKey: PreKeyType = {
      keyId: pk.ki,
      publicKey: pk.kp.pbk,
    };
    directory.storeKeyBundle(name, {
      registrationId,
      identityPubKey: identityKeyPair.pubKey,
      signedPreKey: publicSignedPreKey,
      oneTimePreKeys: [publicPreKey],
    });
    
  };

  const createAdalheidIdentity = async (r) => {
    await createID("adalheid", adiStore, r);
    console.log({ adiStore });
    setAHasIdentity(true);
  };

  const createBrunhildeIdentity = async (r) => {
    await createID("brünhild", brunhildeStore, r);
    console.log({ brunhildeStore });
    setBHasIdentity(true);
  };



  const starterMessageBytes = Uint8Array.from([
    0xce,
    0x93,
    0xce,
    0xb5,
    0xce,
    0xb9,
    0xce,
    0xac,
    0x20,
    0xcf,
    0x83,
    0xce,
    0xbf,
    0xcf,
    0x85,
  ]);


  const startSessionWithBrunhilde = async () => {
    // get Brünhild' key bundle
    const brunhildeBundle = directory.getPreKeyBundle("brünhild");
    console.log({ brunhildeBundle });

    const recipientAddress = brunhildeAddress;

    // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
    const sessionBuilder = new SessionBuilder(adiStore, recipientAddress);

    

    // Process a prekey fetched from the server. Returns a promise that resolves
    // once a session is created and saved in the store, or rejects if the
    // identityKey differs from a previously seen identity for this address.
    console.log("adalheid processing prekey");
    await sessionBuilder.processPreKey(brunhildeBundle!);

    // Now we can send an encrypted message
    const adalheidSessionCipher = new SessionCipher(adiStore, recipientAddress);
    const ciphertext = await adalheidSessionCipher.encrypt(
      starterMessageBytes.buffer
    );

    sendMessage("brünhild", "adalheid", ciphertext);
  };

  const startSessionWithAdalheid = async () => {
    // get Adalheid's key bundle
    console.log(directory);
    const adalheidBundle = directory.getPreKeyBundle("adalheid");
    console.log({ adalheidBundle });

    const recipientAddress = adalheidAddress;

    // Instantiate a SessionBuilder for a remote recipientId + deviceId tuple.
    const sessionBuilder = new SessionBuilder(brunhildeStore, recipientAddress);

    
    // Process a prekey fetched from the server. Returns a promise that resolves
    // once a session is created and saved in the store, or rejects if the
    // identityKey differs from a previously seen identity for this address.
    console.log("brünhild processing prekey");
    await sessionBuilder.processPreKey(adalheidBundle!);

    // Now we can send an encrypted message
    const brunhildeSessionCipher = new SessionCipher(
      brunhildeStore,
      recipientAddress
    );
    var uint8array = new TextEncoder().encode("hello world");
    const ciphertext = await brunhildeSessionCipher.encrypt(
      uint8array.buffer
    );

    

    sendMessage("adalheid", "brünhild", ciphertext);
  };



  const getSessionCipherForRecipient = (to: string) => {
    // send from Brünhild to adalheid so use his store
    const store = to === "adalheid" ? brunhildeStore : adiStore;
    const address = to === "adalheid" ? adalheidAddress : brunhildeAddress;
    return new SessionCipher(store, address);
  };

  const encryptAndSendMessage = async (to: string, message: string) => {
    const cipher = getSessionCipherForRecipient(to);
    const from = to === "adalheid" ? "brünhild" : "adalheid";
    const ciphertext = await cipher.encrypt(
      new TextEncoder().encode(message).buffer
    );
    if (from === "adalheid") {
      setAdalheidTyping("");
    } else {
      setBrunhildeTyping("");
    }
    sendMessage(to, from, ciphertext);
  };


////////////////////////////////////
























































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




//   React.useEffect(() => {

//     const idHand = async(r) => {
      
//       let createIdentity = async () => {
        
//         //await createBrunhildeIdentity();
//         return await createAdalheidIdentity(r);
//       }
  
//       await createIdentity().catch(err => console.log(err))
//     }
//     socket.emit("s");
//     socket.on("s", idHand);
//     return () => {
//       socket.off("s",idHand);
//     };
//   }, [socket])



//   React.useEffect(() => {

//     const idHand = async(r) => {
      
//       let createIdentity = async () => {
        
//         //await createBrunhildeIdentity();
//         return await createBrunhildeIdentity(r);
//       }
  
//       await createIdentity().catch(err => console.log(err))
//     }
//     socket.emit("t");
//     socket.on("t", idHand);
//     return () => {
//       socket.off("t",idHand);
//     };
//   }, [socket])




React.useEffect(() => {
    const timer = setTimeout(() => {
      if(hasSession || !(aHasIdentity && bHasIdentity)) {

        startSessionWithAdalheid();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log(messagesx)
    }, 4000);
    return () => clearTimeout(timer);
  }, []);


  // React.useEffect(() => {
  //   let obj = {
  //     userId: "66bb6e066d22021443d8b064",
  //     friendId: "66bb6d706d22021443d8b061"
  //   }
  //   socket.emit("addFriend", obj);
  // }, []);






    React.useEffect(() => {

    const idHand = async(r) => {
      
      let createIdentity = async () => {
        
        //await createBrunhildeIdentity();
        return await createAdalheidIdentity(r);

      }
  
      await createIdentity().catch(err => console.log(err))
    }
    if(myId) {
      socket.emit("sGetMyId");
      socket.on("sGetMyId", idHand);
    }
    return () => {
      socket.off("sGetMyId",idHand);
    };
  }, [socket, myId])




  React.useEffect(() => {

    const idHand = async(r) => {
      
      let createIdentity = async () => {
        
        return await createBrunhildeIdentity(r);
        //return await createAdalheidIdentity(r);

      }
  
      await createIdentity().catch(err => console.log(err))
    }
    if(friendId) {
      socket.emit("sGetFriendId",friendId);
      socket.on("sGetFriendId", idHand);
    }
    return () => {
      socket.off("sGetFriendId",idHand);
    };
  }, [socket, myId, friendId])











































  
  
  


  React.useEffect(() => {
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








function prepareConvMessagesAndReverse(r) {
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






let tempSelChat:any = [];
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


let currChat = messages.find(e => e.id === tempSelChat[0].id);
let currTempArr = tempArr.find(e => e.id === tempSelChat[0].id);
if(currChat) currChat.messages = currTempArr.messages;
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
    tempArr.push(tempObj);
    tempObj = {
      id:'',
      sender:'',
      messages:[]
    }
  }

});





let tempSelChat:any = [];
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

//setSelectedChat(result);
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
    //can be a error below
    let currentChatId = messages.find(e => e?.id === selectedChat[0]?.id)?.id;
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
        <MessagesPane chat={isMessagesPaneReady} userSender={userSender} friendId={friendId} isFetched={isFetched} isDataPrepared={isDataPrepared} selectedChat={selectedChat.length !== 0} setUserSender={setUserSender} prepareConvMessagesAndReverse={prepareConvMessagesAndReverse}/>
      }
    </Sheet>
  );
}

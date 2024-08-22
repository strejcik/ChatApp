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












import { addMessageToSession, startSession } from './signal-functions';
import { currentSessionSubject, sessionForRemoteUser, sessionListSubject } from './state'
import { useObservable } from './hooks'














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
import { BehaviorSubject } from 'rxjs';
import { ChatSession } from './types';



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




const adalheidAddress = new SignalProtocolAddress("adalheid", 1);
const brunhildeAddress = new SignalProtocolAddress("brünhild", 1);

export default function MyProfile() {
  const session = useObservable(currentSessionSubject, null)
  const {myId, setMyId} = useContext(idContext);
  const [friendId, setFriendId] = React.useState<string>();
  const {messages, setMessages} = useContext(messagesContext);





  const [mySigObjId, setMySigObjId] = React.useState("");
  const [adiStore, setAdiStore] = React.useState(new SignalProtocolStore());
  const [brunhildeStore, setBrunhildeStore] = React.useState(new SignalProtocolStore());


  const [aHasIdentity, setAHasIdentity] = React.useState(false);
  const [bHasIdentity, setBHasIdentity] = React.useState(false);





  const [directory] = React.useState(new SignalDirectory());
  const [messagesx, setMessagesx] = React.useState<any>([]);
  const [processedMessages, setProcessedMessages] = React.useState<
    ProcessedChatMessage[]
  >([]);

  const [hasSession, setHasSession] = React.useState(false);

  const [adalheidTyping, setAdalheidTyping] = React.useState("");
  const [brunhildeTyping, setBrunhildeTyping] = React.useState("");

  const [processing, setProcessing] = React.useState(false);


  const hasMyIdChanged = useCompare(myId);
  const hasMyMessagesChanged = useCompare(messages);
  function useCompare (val) {
    const prevVal = usePrevious(val)
    return prevVal !== val
  }
  
  // Helper hook
  function usePrevious(value) {
    const ref = React.useRef();
    React.useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }



  const sendMessage = (to: string, from: string, message: MessageType) => {
    const msg = { to, from, message, delivered: false, id: getNewMessageID() };
    setMessagesx(prev => [...prev, msg]);
  };

  // React.useEffect(() => {
  //   if (processing) {
  //     return;
  //   }

  //   const getReceivingSessionCipherForRecipient = (to: string) => {
  //     // send from Brünhild to Adalheid so use his store
  //     const store = to === "brünhild" ? brunhildeStore : adiStore;
  //     const address = to === "brünhild" ? adalheidAddress : brunhildeAddress;
  //     return new SessionCipher(store, address);
  //   };

  //   const doProcessing = async () => {
      
  //     // const cipher = getReceivingSessionCipherForRecipient(nextMsg.to);
  //     // const processed = await readMessage(nextMsg, cipher);
  //     if(selectedChat.length !== 0 && isDataPrepared && myId && friendId && messages && (toggle === true || toggle === false)) {
  //       // const to = friendId === "66bb6d706d22021443d8b061" ? "brünhild" : "adalheid";
  //       // const from = to === "adalheid" ? "brünhild" : "adalheid";
        
        

  //       await messages.forEach(async e => {
  //         await e.messages.forEach(async x => {
  //           let cipher = await getReceivingSessionCipherForRecipient("brünhild");
  //           let processed = await readMessage(x.content, cipher);
  //           console.log(processed.messageText);
  //         })
  //       })
  //     }
  //     setProcessing(true);
  //   };
  //   doProcessing().then(() => {
  //     setProcessing(false);
  //     console.log(processedMessages);
  //   }).catch(err => console.error(err));
  // }, [messages]);





  const readMessage = async (msg, cipher: SessionCipher) => {
    let plaintext: ArrayBuffer = new Uint8Array().buffer;
    if (msg.message.type === 3) {
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


  // const createAdalheidIdentity = async (r) => {
  //   await createID(myId, adiStore, r);
  //   console.log({ adiStore });
  //   setAHasIdentity(true);
  // };

  const createAdalheidIdentity = async (r) => {
    await createID("adalheid", adiStore, r);
    console.log({ adiStore });
    setAHasIdentity(true);
  };

  // const createBrunhildeIdentity = async (r) => {
  //   await createID(friendId as string, brunhildeStore, r);
  //   console.log({ brunhildeStore });
  //   setBHasIdentity(true);
  // };

  const createBrunhildeIdentity = async (r) => {
    await createID("brünhild", brunhildeStore, r);
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
    startSession("brünhild")
    // // Now we can send an encrypted message
    // const adalheidSessionCipher = new SessionCipher(adiStore, recipientAddress);
    // const ciphertext = await adalheidSessionCipher.encrypt(
    //   starterMessageBytes.buffer
    // );

    // sendMessage("brünhild", "adalheid", ciphertext);
  };

  const startSessionWithAdalheid = async () => {
    // get Adalheid's key bundle
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

    // // Now we can send an encrypted message
    // const brunhildeSessionCipher = new SessionCipher(
    //   brunhildeStore,
    //   recipientAddress
    // );
    // const ciphertext = await brunhildeSessionCipher.encrypt(
    //   starterMessageBytes.buffer
    // );

    // sendMessage("adalheid", "brünhild", ciphertext);
  };


  const encryptAndSendMessage = async (to: string, message: string) => {
    const cipher = getSessionCipherForRecipient(to);
    const from = to === myId ? friendId as string: myId;
    const ciphertext = await cipher.encrypt(
      new TextEncoder().encode(message).buffer
    );
    if (from === myId) {
      setAdalheidTyping("");
    } else {
      setBrunhildeTyping("");
    }
    sendMessage(to, from, ciphertext);
  };


////////////////////////////////////






















































const getSessionCipherForRecipient = (to: string) => {
  // send from Brünhild to myId so use his store
  const store = to === myId ? brunhildeStore : adiStore;
  const address = to === myId ? adalheidAddress : brunhildeAddress;
  return new SessionCipher(store, address);
};

  const socket = useContext(SocketContext);
  const [selectedChat, setSelectedChat] = React.useState(messages[0]);
  const [isFetched, setIsFetched] = React.useState<boolean>(false);
  const [isDataPrepared, setIsDataPrepared] = React.useState<boolean>(false);
  const [userSender, setUserSender] = React.useState<any>();
  const [enableConversationFetching, setIsConversationFetched] = React.useState<boolean>(false);
  const [toggle, setToggle] = React.useState(true);

  React.useEffect(() => {
    if (processing) {
      return;
    }

    const getReceivingSessionCipherForRecipient = (to: string) => {
      // send from Brünhild to Adalheid so use his store
      const store = to === "brünhild" ? brunhildeStore : adiStore;
      const address = to === "brünhild" ? adalheidAddress : brunhildeAddress;
      return new SessionCipher(store, address);
    };
    // const doProcess = async () => {
    //   if(messages) {
    //     return await messages.forEach(async e => {
    //       e?.messages?.forEach(async x => {
    //         sendMessage("brünhild", "adalheid", x.content);
    //       })
    //     })
    //   }
    // }
    
    const doProcessing = async () => {
      let i = 0;
      while (messagesx.length > 0) {
        let nextMsg = messagesx.shift();
        if (!nextMsg) {
          continue;
        }
        // console.log(nextMsg);
        if( i >= 0) {
          

        startSessionWithBrunhilde();
        
        const session : ChatSession= sessionForRemoteUser(nextMsg.to) || {
          remoteUsername: nextMsg.to,
          messages: [],
      }
      
  
      const sessionList = [...sessionListSubject.value]
      sessionList.unshift(session)
      sessionListSubject.next(sessionList)
  
  
      let cm: ProcessedChatMessage | null = null

      let cipher = await getReceivingSessionCipherForRecipient(nextMsg.to);
      let plaintext: ArrayBuffer = new Uint8Array().buffer;
      if (nextMsg.message.type === 3) {
        plaintext = await cipher.decryptPreKeyWhisperMessage(
          nextMsg.message.body!,
          "binary"
        );


      } else if (nextMsg.message.type === 1) {
        plaintext = await cipher.decryptWhisperMessage(
          nextMsg.message.body!,
          "binary"
        );
      }

      let stringPlaintext = new TextDecoder().decode(new Uint8Array(plaintext));
      addMessageToSession(nextMsg.to, stringPlaintext)
      console.log(stringPlaintext);
      i++;
        }
      }


    };

    
    setProcessing(true);
    doProcessing().then(() => {
      setProcessing(false);
    }).catch(err => console.log(err));

  }, [ messagesx, toggle]);
  

  const hasSelectedChatChanged = useCompare(selectedChat);





//   React.useEffect(() => {

//     const idHand = async(r) => {
      
//       let createIdentity = async () => {
        
//         //await createBrunhildeIdentity();
//         return await createMyIdentity(r);
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




// React.useEffect(() => {
//   if(myId) {
//     createAdalheidIdentity();
//     startSessionWithBrunhilde();
//     console.log('inside');
//   }
//   }, [myId]);





  // React.useEffect(() => {
  //   console.log(processedMessages)
  // }, [messagesx]);


  // React.useEffect(() => {
  //   let obj = {
  //     userId: "66bb6e066d22021443d8b064",
  //     friendId: "66bb6d706d22021443d8b061"
  //   }
  //   socket.emit("addFriend", obj);
  // }, []);

  // React.useEffect(() => {
  //   if (processing) {
  //     return;
  //   }

  //   const getReceivingSessionCipherForRecipient = (to: string) => {
  //     // send from Brünhild to Adalheid so use his store
  //     const store = to === friendId ? brunhildeStore : adiStore;
  //     const address = to === friendId ? adalheidAddress : brunhildeAddress;
  //     return new SessionCipher(store, address);
  //   };

  //   // const doProcessing = async () => {
  //   //   while (messagesx.length > 0) {
  //   //     const nextMsg = messagesx.shift();
  //   //     if (!nextMsg) {
  //   //       continue;
  //   //     }
  //   //     const cipher = getReceivingSessionCipherForRecipient(nextMsg.to);
  //   //     const processed = await readMessage(nextMsg, cipher);
  //   //     processedMessages.push(processed as any);
  //   //   }
  //   //   setMessagesx([...messagesx]);
  //   //   setProcessedMessages([...processedMessages]);
  //   // };


  //   const doProcessing = async () => {
  //     if(selectedChat.length !== 0 && isDataPrepared && myId && friendId && messages) {
  //       let cipher = await getReceivingSessionCipherForRecipient(messages[0].sender._id);
  //         let processed = await readMessage(messages[0].messages[0].content, cipher);
  //         setMessagesx([processed.messageText])
  //           console.log('PM', processed.messageText);
  //           console.log('ASOIGNOPSINGOSDINOISDNGOISENGSEIONG')
       
  //     }
  //   }
  //   setProcessing(true);
  //   doProcessing().then(() => {
  //     setProcessing(false);
  //     console.log(messagesx);
  //   });
  // }, [adiStore, brunhildeStore, isDataPrepared, messages, toggle]);





  //   React.useEffect(() => {

  //   const sidHand = async(rsp) => {
  //     await createMyIdentity(rsp);
  //   }
  //   if(myId) {
  //     socket.emit("sxGetMyId");
  //     socket.on("sxGetMyId",sidHand);
  //   }
  //   return () => {
  //     socket.off("sxGetMyId",sidHand);
  //   };
  // }, [socket, myId])




  // React.useEffect(() => {

  //   const idHand = async(r) => {
  //   await createBrunhildeIdentity(r);
  //     //start session fater clicking chat contact
  //   }
  //   if(friendId) {
  //     socket.emit("sGetFriendId",friendId);
  //     socket.on("sGetFriendId", idHand);
  //   }
  //   return () => {
  //     socket.off("sGetFriendId",idHand);
  //   };
  // }, [socket, myId, toggle])



































  // React.useEffect(() => {
  //   const sidHand = async(rsp) => {
  //     //1 await createAdalheidIdentity(rsp);
  //     if(myId === "66bb6e066d22021443d8b064"){
  //       console.log('inside#2');
  //       await createBrunhildeIdentity(rsp);
  //     }
  //     if(myId === "66bb6d706d22021443d8b061") {
  //       console.log('inside#1');
  //       await createAdalheidIdentity(rsp);
  //     }
  //   }
  //   if(hasSession || !(aHasIdentity && bHasIdentity)) {
  //     //createBrunhildeIdentity();
  //     if(myId) {
  //       socket.emit("sxGetMyId");
  //       socket.on("sxGetMyId",sidHand);
  //     }

  //   }
  //   return () => {
  //     socket.off("sxGetMyId",sidHand);
  //   };
  // }, [hasSession, aHasIdentity, bHasIdentity, myId, toggle]);


  //   React.useEffect(() => {

  //   const idHand = async(r) => {
  //     if(friendId === "66bb6e066d22021443d8b064") {
  //       console.log('inside#1');
  //       await createBrunhildeIdentity(r);
  //       await startSessionWithAdalheid();
  //     }
  //     if( friendId=== "66bb6d706d22021443d8b061") {
  //       console.log('inside#2');
  //       await createAdalheidIdentity(r);
  //       await startSessionWithBrunhilde();
  //     }
  //   //1 await startSessionWithBrunhilde();
  //   }
  //   if(friendId) {
  //     socket.emit("sGetFriendId",friendId);
  //     socket.on("sGetFriendId", idHand);
  //   }
  //   return () => {
  //     socket.off("sGetFriendId",idHand);
  //   };
  // }, [toggle])


  // React.useEffect(() => {
  //   const sidHand = async(rsp) => {
  //     await createAdalheidIdentity(rsp);
  //   }
  //   if(hasSession || !(aHasIdentity && bHasIdentity)) {
  //     //createBrunhildeIdentity();
  //     if(myId) {
  //       socket.emit("sxGetMyId");
  //       socket.on("sxGetMyId",sidHand);
  //     }

  //   }
  //   return () => {
  //     socket.off("sxGetMyId",sidHand);
  //   };
  // }, [hasSession, aHasIdentity, bHasIdentity, myId]);


  //   React.useEffect(() => {

  //   const idHand = async(r) => {
  //   await createBrunhildeIdentity(r);
  //     //start session fater clicking chat contact
  //     //   const timer = setTimeout(() =>{
       
  // //     //startSessionWithAdalheid();
  // //   }, 3000);
  //   await startSessionWithBrunhilde();
  //   }
  //   if(friendId) {
  //     socket.emit("sGetFriendId",friendId);
  //     socket.on("sGetFriendId", idHand);
  //   }
  //   return () => {
  //     socket.off("sGetFriendId",idHand);
  //   };
  // }, [socket, myId, toggle])




    React.useEffect(() => {
    const sidHand = async(rsp) => {
      //1 await createAdalheidIdentity(rsp);
      if(myId === "66bb6e066d22021443d8b064"){
        console.log('inside#2, myId');
        await createBrunhildeIdentity(rsp);
      }
      if(myId === "66bb6d706d22021443d8b061") {
        console.log('inside#1, myId');
        await createAdalheidIdentity(rsp);
      }
    }
    if(hasSession || !(aHasIdentity && bHasIdentity)) {
      //createBrunhildeIdentity();
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
      if(friendId === "66bb6e066d22021443d8b064") {
        console.log('inside#1');
        // await createBrunhildeIdentity(r);
        // await startSessionWithAdalheid();

            await createBrunhildeIdentity(r);
            await startSessionWithBrunhilde();

      }
      if( friendId=== "66bb6d706d22021443d8b061") {
        console.log('inside#2');
        await createAdalheidIdentity(r);
        await startSessionWithBrunhilde();
      }
    //1 await startSessionWithBrunhilde();
    }
    if(friendId) {
      socket.emit("sGetFriendId",friendId);
      socket.on("sGetFriendId", idHand);
    }
    return () => {
      socket.off("sGetFriendId",idHand);
    };
  }, [friendId])







  













































  // React.useEffect(() => {
  //   const sidHand = async(rsp) => {
  //     //1 await createAdalheidIdentity(rsp);
      
  //     if(gTo) {
  //       console.log('GTO', gTo);
  //       createBrunhildeIdentity(rsp);
  //     } else {
  //       createAdalheidIdentity(rsp);
  //     }
  //   }
  //   if(hasSession || !(aHasIdentity && bHasIdentity)) {
  //     //createBrunhildeIdentity();
  //     if(myId) {
  //       socket.emit("sxGetMyId");
  //       socket.on("sxGetMyId",sidHand);
  //     }

  //   }
  //   return () => {
  //     socket.off("sxGetMyId",sidHand);
  //   };
  // }, [hasSession, aHasIdentity, bHasIdentity, myId]);


  //   React.useEffect(() => {

  //   const idHand = async(r) => {
  //   //1 await createBrunhildeIdentity(r);
  //   if(gTo) {
  //     console.log('GTO', gTo);
  //     await createAdalheidIdentity(r);

  //     startSessionWithAdalheid();
  //   } else {
  //     await createBrunhildeIdentity(r);
  //     startSessionWithBrunhilde();
  //   }
  //   //1 await startSessionWithBrunhilde();
  //   }
  //   if(friendId) {
  //     socket.emit("sGetFriendId",friendId);
  //     socket.on("sGetFriendId", idHand);
  //   }
  //   return () => {
  //     socket.off("sGetFriendId",idHand);
  //   };
  // }, [socket, myId, toggle])













  // React.useEffect(() => {
  //   const timer = setTimeout(() =>{
       
  //     //startSessionWithAdalheid();
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  






























  
  
  


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


const prepareContactList = async(r) => {
  console.log(r);
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






// const doProcessing = async () => {
//   tempArr.forEach(async e => {
//     e.messages.forEach(async x => {
//       let cipher = await getReceivingSessionCipherForRecipient(x.sender._id);
//       let processed = await readMessage(x.content, cipher);
//       x.content = processed.messageText;
//     })
  
//   })
// }

// await doProcessing().then(() => {

//   });


  setMessages(tempArr)
  setSelectedChat(tempArr);
  setIsDataPrepared(true);


  
}








async function prepareConvMessagesAndReverse(r) {;
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





// const doProcessing = async () => {
//   await tempArr.forEach(async e => {
//     e.messages.forEach(async x => {
//       let cipher = await getReceivingSessionCipherForRecipient(x.sender._id);
//       let processed = await readMessage(x.content, cipher);
//       x.content = processed.messageText;
//     })
  
//   })
  
//   await tempSelChat.forEach(async e => {
//     e.messages.forEach(async x => {
//       let cipher = await getReceivingSessionCipherForRecipient(x.sender._id);
//       let processed = await readMessage(x.content, cipher);
//       x.content = processed.messageText;
//     })
  
//   })


// }

// await doProcessing().then(() => {



    
//   });

  tempArr.sort(dynamicSort("id"));

  let currChat = messages.find(e => e.id === tempSelChat[0].id);
  let currTempArr = tempArr.find(e => e.id === tempSelChat[0].id);

  // currChat.messages.forEach(async e => {
  //   let cipher = await getReceivingSessionCipherForRecipient(currChat._id);
  //   let processed = await readMessage(e.content, cipher);
  //   e.content = processed.messageText
  // })
  
  
  if(currChat) currChat.messages = currTempArr.messages;






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
      let to = tempObj2.sender["_id"] === "66bb6d706d22021443d8b061" ? "brünhild" : "adalheid";
      let from = to === "adalheid" ? "brünhild" : "adalheid";
      sendMessage(to, from, x.message);
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

// const doProcessing = async () => {
//   tempArr.forEach(async e => {
//     e.messages.forEach(async x => {
//       let cipher = await getReceivingSessionCipherForRecipient(x.sender._id);
//       let processed = await readMessage(x.content, cipher);
//       x.content = processed.messageText;
//     })
  
//   })
  
//   tempSelChat.forEach(async e => {
//     e.messages.forEach(async x => {
//       let cipher = await getReceivingSessionCipherForRecipient(x.sender._id);
//       let processed = await readMessage(x.content, cipher);
//       x.content = processed.messageText;
//     })
  
//   })
// }

// await doProcessing().then(() => {

//   });
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
    if(session) {
      console.log(session);
    }

    let currentChatId = messages.find(e => e?.id === selectedChat[0]?.id)?.id;
    let userObj = {
      userId: myId,
      conversation_id: currentChatId,
    }
    console.log(selectedChat);
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
          chats={selectedChat}
          selectedChatId={selectedChat[0].id}
          setSelectedChat={setSelectedChat}
          setFriendId={setFriendId}
          friendId={friendId}
          enableConversationFetching = {enableConversationFetching}
          setIsConversationFetched={setIsConversationFetched}
          setToggle={setToggle}
          toggle={toggle}
          readMessage={readMessage}
        />
        }
      </Sheet>
      {
        <MessagesPane 
        chat={isMessagesPaneReady} 
        userSender={userSender} 
        friendId={friendId} 
        isFetched={isFetched} 
        isDataPrepared={isDataPrepared} 
        selectedChat={selectedChat.length !== 0} 
        setUserSender={setUserSender} 
        prepareConvMessagesAndReverse={prepareConvMessagesAndReverse}
        getSessionCipherForRecipient={getSessionCipherForRecipient}
        sendMessage={sendMessage}
        adiStore={adiStore}
        brunhildeStore={brunhildeStore}
        />
      }
    </Sheet>
  );
}


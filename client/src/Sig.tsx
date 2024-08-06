import React , {useState, useEffect} from 'react';
import './App.css';
import socketIO from 'socket.io-client';
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
const socket = socketIO('http://localhost:5000', {
  secure: true
});



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

function App() {
  const [adiStore] = useState(new SignalProtocolStore());
  const [brunhildeStore] = useState(new SignalProtocolStore());


  const [aHasIdentity, setAHasIdentity] = useState(false);
  const [bHasIdentity, setBHasIdentity] = useState(false);





  const [directory] = useState(new SignalDirectory());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processedMessages, setProcessedMessages] = useState<
    ProcessedChatMessage[]
  >([]);

  const [hasSession, setHasSession] = useState(false);

  const [adalheidTyping, setAdalheidTyping] = useState("");
  const [brunhildeTyping, setBrunhildeTyping] = useState("");

  const [processing, setProcessing] = useState(false);

  const sendMessage = (to: string, from: string, message: MessageType) => {
    const msg = { to, from, message, delivered: false, id: getNewMessageID() };
    setMessages([...messages, msg]);
  };





  useEffect(() => {
    if (!messages.find((m) => !m.delivered) || processing) {
      return;
    }

    const getReceivingSessionCipherForRecipient = (to: string) => {
      // send from Brünhild to Adalheid so use his store
      const store = to === "brünhild" ? brunhildeStore : adiStore;
      const address = to === "brünhild" ? adalheidAddress : brunhildeAddress;
      return new SessionCipher(store, address);
    };

    const doProcessing = async () => {
      while (messages.length > 0) {
        const nextMsg = messages.shift();
        if (!nextMsg) {
          continue;
        }
        const cipher = getReceivingSessionCipherForRecipient(nextMsg.to);
        const processed = await readMessage(nextMsg, cipher);
        processedMessages.push(processed);
      }
      setMessages([...messages]);
      setProcessedMessages([...processedMessages]);
    };
    setProcessing(true);
    doProcessing().then(() => {
      setProcessing(false);
    });
  }, [adiStore, brunhildeStore, messages, processedMessages, processing]);


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

  const createID = async (name: string, store: SignalProtocolStore) => {
    let res;
    try {
      socket.emit('createID');
    socket.on("createID", async r => {
      res = r;





      let createIdObj:any = res;
      const registrationId = KeyHelper.generateRegistrationId();
      storeSomewhereSafe(store)(`registrationID`, registrationId);
      const {
        baseKeyId,
        identityKeyPair,
        preKey,
        signedPreKeyId,
        signedPreKey } = createIdObj;

      store.storePreKey(`${baseKeyId}`, preKey.keyPair);
      store.storeSignedPreKey(signedPreKeyId, signedPreKey.keyPair);
      const publicSignedPreKey: SignedPublicPreKeyType = {
        keyId: signedPreKeyId,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature,
      };


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

      
    })
    return res;
  }catch(err) {
    console.log(res);
  }

    
  };

  const createAdalheidIdentity = async () => {
    await createID("adalheid", adiStore);
    console.log({ adiStore });
    setAHasIdentity(true);
  };

  const createBrunhildeIdentity = async () => {
    await createID("brünhild", brunhildeStore);
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
    const ciphertext = await brunhildeSessionCipher.encrypt(
      starterMessageBytes.buffer
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

  createID("sample", adiStore);
  return (
    <>
    <h1>HENLO</h1>
    </>
  );
}

export default App;

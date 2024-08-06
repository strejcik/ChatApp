import { createContext, SetStateAction, Dispatch } from 'react';


interface messagesContextInterface {
    messages: Array<any>;
    setMessages: Dispatch<SetStateAction<Array<string>>>;
  }


const messagesContext = createContext<messagesContextInterface>({
    messages: [],
    setMessages: () => { },
});

export default messagesContext;
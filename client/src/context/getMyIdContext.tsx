import { createContext, SetStateAction, Dispatch } from 'react';


interface idContextInterface {
    myId: string;
    setMyId: Dispatch<SetStateAction<string>>;
  }


const idContext = createContext<idContextInterface>({
    myId: '',
    setMyId: () => { },
});

export default idContext;
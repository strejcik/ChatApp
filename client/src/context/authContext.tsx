import { createContext, SetStateAction, Dispatch } from 'react';


interface authContextInterface {
    auth: boolean;
    setAuth: Dispatch<SetStateAction<boolean>>;
    accountCreated: boolean;
    setAccountCreated: Dispatch<SetStateAction<boolean>>;
  }


const authContext = createContext<authContextInterface>({
    auth: false,
    setAuth: () => { },
    accountCreated: false,
    setAccountCreated: () => { }
});

export default authContext;
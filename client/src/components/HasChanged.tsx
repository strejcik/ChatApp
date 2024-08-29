import { useEffect, useState, useRef } from "react";

const HasChanged = ({ prop1, prop2, prop3}): JSX.Element => {
    const hasProp1Changed = useCompare(prop1);
    const [id, setId] = useState<any>([]);
    useEffect(() => {
      if (hasProp1Changed) {
        let res = id.find(e => e === prop1);
        if(!res) {setId((prev) => [...prev, prop1]); }
        if(res) {
          prop2(false);
          prop3.forEach(e => {
            e?.messages?.forEach(b => {
              if(b.processed === true) {
                prop2(true);
                return;
              }
            })
            
          })
        }else {
          prop2(false);
          prop3.forEach(e => {
            e?.messages?.forEach(b => {
              if(b.processed === true) {
                prop2(true);
                return;
              }
            })
          })
        }
      }
    });
    return (<></>)
  };
  
  const useCompare = val => {
    //console.log(`val=${val}`);
    const prevVal = usePrevious(val);
    //console.log(`prevVal=${prevVal}`);
  
    return prevVal !== val;
  };
  
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }



  export default HasChanged;
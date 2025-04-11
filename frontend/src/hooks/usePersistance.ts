import { useEffect, useMemo, useState } from "react";

export const usePersistance = (init_val:boolean, gameId:string|undefined) => {
    // Set initial value
    const initial_value = useMemo(() => {
      const local_storage_value = localStorage.getItem(`added:${gameId}`);
      // If there is a value stored in localStorage, use that
      if(local_storage_value) {
        return JSON.parse(local_storage_value);
      } 
      // Otherwise use initial_value that was passed to the function
      return init_val;
    },[]);
  
    const [added, setAdded] = useState(initial_value);
  
    useEffect(() => {
      const state_str = JSON.stringify(added); // Stringified state
      localStorage.setItem(`added:${gameId}`, state_str) // Set stringified state as item in localStorage
    }, [added]);
  
    return [added, setAdded];
  }
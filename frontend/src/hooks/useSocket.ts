import { useEffect, useState } from "react";
import { useUser } from "./useUser";

const ws_URL = "https://chess-ws-5iv3.onrender.com";

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const user = useUser();
    useEffect(()=>{
        if(!user) return;
        const ws = new WebSocket(`${ws_URL}?token=${user.token}`);

        ws.onopen = ()=> {
            setSocket(ws);
        }

        ws.onclose = ()=> {
            setSocket(null);
        }

        // return ()=>{
        //     ws.close();
        // }
    }, [user])
    return socket;
}
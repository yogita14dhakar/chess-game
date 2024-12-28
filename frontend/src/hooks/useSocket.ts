import { useEffect, useState } from "react";
import { useUser } from "../../../modules/src/hooks/useUser";

const ws_URL = "ws://localhost:8080";

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
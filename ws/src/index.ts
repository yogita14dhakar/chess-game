import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import { extractAuthUser } from './auth';
import url from "url";

const wss = new WebSocketServer({port: 8080});

const gameManager = new GameManager();

wss.on("connection", function connection(ws, req){
    //@ts-ignore
    const query = url.parse(req.url);
    const link = url.parse(req.url, true);
    const token: string = url.parse(req.url, true).query.token;
    console.log("token", token);
    console.log("query",query);
    console.log("link", link);
    const user = extractAuthUser(token, ws);
    gameManager.addUser(user);
    
    ws.on("disconnect", ()=> gameManager.removeUser(ws))
});

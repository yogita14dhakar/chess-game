import { Request, Response, Router } from "express";
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { COOKIE_MAX_AGE } from "../const";
import { insertUser , update} from '../modules/src/db';
import dotenv from 'dotenv';


dotenv.config();
const router = Router();

router.post('/', async(req: Request, res: Response) => {
    let bodyData = req.body
    let startTime = new Date(Date.now());
    const q = "INSERT INTO Game (id, whitePlayerId, blackPlayerId, status, currentFen, startAt, timeControl) VALUES ?";
    const VALUES = [[bodyData.gameId, bodyData.user , `computer`, 'IN_PROGRESS','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', startTime, 'CLASSICAL']];
    await insertUser(q, VALUES);
    const q1 = `SELECT * FROM User WHERE id = '${bodyData.user}'`
    let whitePlayer = await update(q1);
    res.json({
        gameId: bodyData.gameId,
        payload: {
            blackPlayer: {
                name: `computer`,
                id: `computer`,
                isGuset: false
            },
            whitePlayer: {
                name: whitePlayer.name,
                id: whitePlayer.id,
                isGuest: whitePlayer.provider === 'GUEST' ? true : false 
            }
        }
    })
})
export default router;
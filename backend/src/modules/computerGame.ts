import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { findMany, insertUser , transaction, update} from '../modules/src/db';
import dotenv from 'dotenv';


dotenv.config();
const router = Router();
let lastMoveTime = new Date(Date.now());

router.post('/', async(req: Request, res: Response) => {
    let bodyData = req.body
    let startTime = new Date(Date.now());
    lastMoveTime = startTime;
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
});

router.get('/move', async(req: Request, res: Response) => {
    let bodyData = req.body
    
});

router.post('/add', async(req: Request, res: Response) => {
    let bodyData = req.body
    const player1TimeConsumed = bodyData.player1TimeConsumed + (bodyData.moveTimestamp.getTime() - new Date(lastMoveTime).getTime());
    const q1 = "INSERT INTO Move (id, gameId, moveNumber, `from`, `to`, `before`, `after`, createdAt, timeTaken, san) VALUES ?";
    const VALUES = [[uuidv4(), bodyData.gameId, bodyData.moveCount+1, bodyData.move.from, bodyData.move.to, bodyData.move.before, bodyData.move.after, bodyData.moveTimestamp, bodyData.moveTimestamp.getTime() - new Date(lastMoveTime).getTime(), bodyData.move.san]];
    const q2 = `UPDATE Game SET currentFen = '${bodyData.move.after}' WHERE id = '${bodyData.gameId}'`;
    await transaction(q1, q2, VALUES);
    lastMoveTime = bodyData.moveTimeStamp;
    // const q1 = `SELECT * FROM User WHERE id = '${bodyData.user}'`
    // let whitePlayer = await update(q1);
    res.json({
       player1: player1TimeConsumed, 
    })
});

router.post('/end', async(req: Request, res: Response) => {
    let bodyData = req.body
    await update(`UPDATE Game SET status = '${bodyData.status}', result = '${bodyData.result}', endAt = CURRENT_TIMESTAMP() WHERE id = '${bodyData.gameId}'`);
    const updatedGame = await update(`SELECT * FROM Game WHERE id = '${bodyData.gameId}'`);
    const allMoves = await findMany(`SELECT * FROM Move WHERE gameId = '${updatedGame?.id}' ORDER BY moveNumber ASC`);
    const whitePlayer = await update(`SELECT * FROM User WHERE id = '${updatedGame?.whitePlayerId}'`);
    const blackPlayer = await update(`SELECT * FROM User WHERE id = '${updatedGame?.blackPlayerId}'`);
    res.json({
        gameId: bodyData.gameId,
        payload: {
          result: bodyData.result,
          status: bodyData.status,
          moves: allMoves,
          blackPlayer: {
            id: updatedGame?.blackPlayerId,
            name: blackPlayer?.name,
          },
          whitePlayer: {
            id: updatedGame?.whitePlayerId,
            name: whitePlayer?.name,
          },
        },
    })
});
export default router;
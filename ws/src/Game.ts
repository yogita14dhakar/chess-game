import { Chess, Move, Square } from 'chess.js';
import { INIT_GAME, MOVE, AuthProvider, GAME_ENDED} from "./modules/src/Message";
import { insertUser, update, findMany, transcationUpdate} from "./modules/src/db";
import { randomUUID } from 'crypto';
import { socketManager, User } from './SocketManager';
import { GameResult, GameStatus } from './modules/src/Message';
import { GAME_TIME_MS } from './modules/const';
import { addMoveToDb } from './modules/queue';

export function isPromoting(chess: Chess, from: Square, to: Square) {
    if (!from) {
      return false;
    }
  
    const piece = chess.get(from);
  
    if (piece?.type !== 'p') {
      return false;
    }
  
    if (piece.color !== chess.turn()) {
      return false;
    }
  
    if (!['1', '8'].some((it) => to.endsWith(it))) {
      return false;
    }
  
    return chess
      .moves({ square: from, verbose: true })
      .map((it) => it.to)
      .includes(to);
}

export class Game{
    public gameId: string;
    public player1UserId: string;
    public player2UserId: string | null;
    public board: Chess;
    private moveCount = 0;
    private timer: NodeJS.Timeout | null = null;
    private moveTimer: NodeJS.Timeout | null = null;
    public result: GameResult | null = null;
    private player1TimeConsumed = 0;
    private player2TimeConsumed = 0;
    private startTime = new Date(Date.now());
    private lastMoveTime = new Date(Date.now());

    constructor(player1UserId: string, player2UserId: string | null, gameId?: string, startTime?: Date){
        this.player1UserId = player1UserId;
        this.player2UserId = player2UserId;
        this.board = new Chess();
        this.gameId = gameId ?? randomUUID();
        if (startTime) {
            this.startTime = startTime;
            this.lastMoveTime = startTime;
        }
    }

    seedMoves(moves: {
        id: string;
        gameId: string;
        moveNumber: number;
        from: string;
        to: string;
        comments: string | null;
        timeTaken: number | null;
        createdAt: Date;
      }[]) {
        moves.forEach((move) => {
          if (
            isPromoting(this.board, move.from as Square, move.to as Square)
          ) {
            this.board.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
          } else {
            this.board.move({
              from: move.from,
              to: move.to,
            });
          }
        });
        this.moveCount = moves.length;
        if (moves[moves.length - 1]) {
          this.lastMoveTime = moves[moves.length - 1].createdAt;
        }
    
        moves.map((move, index) => {
          if (move.timeTaken) {
            if (index % 2 === 0) {
              this.player1TimeConsumed += move.timeTaken;
            } else {
              this.player2TimeConsumed += move.timeTaken;
            }
          }
        });
        this.resetAbandonTimer();
        this.resetMoveTimer();
      }

    async updateSecondPlayer(player2UserId: string) {
    this.player2UserId = player2UserId;
    const q = `SELECT * FROM User WHERE id IN ('${this.player1UserId}', '${this.player2UserId}')`
    let users = await findMany(q);
        console.log(users);
    try {
      await this.createGameInDb();
    } catch (e) {
      console.error(e);
      return;
    }

    const WhitePlayer = users.find((user: any) => user.id === this.player1UserId);
    const BlackPlayer = users.find((user: any) => user.id === this.player2UserId);

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          gameId: this.gameId,
          whitePlayer: {
            name: WhitePlayer?.name,
            id: this.player1UserId,
            isGuest: WhitePlayer?.provider === AuthProvider.GUEST,
          },
          blackPlayer: {
            name: BlackPlayer?.name,
            id: this.player2UserId,
            isGuest: BlackPlayer?.provider === AuthProvider.GUEST,
          },
          fen: this.board.fen(),
          moves: [],
        },
      }),
    );
  }

  async createGameInDb() {
    this.startTime = new Date(Date.now());
    this.lastMoveTime = this.startTime;
    const q = "INSERT INTO Game (id, whitePlayerId, blackPlayerId, status, currentFen, startAt, timeControl) VALUES ?";
    const VALUES = [[this.gameId, this.player1UserId, this.player2UserId, 'IN_PROGRESS','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', this.startTime, 'CLASSICAL']];
    await insertUser(q, VALUES); 
  }

  async makeMove(
    user: User,
    move: Move
  ) {
    
    // validate the type of move using zod
    if (this.board.turn() === 'w' && user.userId !== this.player1UserId) {
      return;
    }

    if (this.board.turn() === 'b' && user.userId !== this.player2UserId) {
      return;
    }

    if (this.result) {
      console.error(`User ${user.userId} is making a move post game completion`);
      return;
    }

    const moveTimestamp = new Date(Date.now());

    try {
      if (isPromoting(this.board, move.from, move.to)) {
        this.board.move({
          from: move.from,
          to: move.to,
          promotion: 'q',
        });
      } else {
        this.board.move({
          from: move.from,
          to: move.to,
        });
      }
    } catch (e) {
      console.error("Error while making move");
      return;
    }

    // flipped because move has already happened
    if (this.board.turn() === 'b') {
      this.player1TimeConsumed = this.player1TimeConsumed + (moveTimestamp.getTime() - new Date(this.lastMoveTime).getTime());
    }

    if (this.board.turn() === 'w') {
      this.player2TimeConsumed = this.player2TimeConsumed + (moveTimestamp.getTime() - new Date(this.lastMoveTime).getTime());
    }

    const VALUES = [[randomUUID(), this.gameId, this.moveCount+1, move.from, move.to, move.before, move.after, moveTimestamp.toISOString().slice(0, 19).replace('T', ' '), moveTimestamp.getTime() - new Date(this.lastMoveTime).getTime(), move.san]];
    const q2 = `UPDATE Game SET currentFen = '${move.after}' WHERE id = '${this.gameId}'`;
    await addMoveToDb(VALUES, q2);
    
    this.resetAbandonTimer()
    this.resetMoveTimer();

    this.lastMoveTime = moveTimestamp;

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE,
        payload: { move, player1TimeConsumed: this.player1TimeConsumed, player2TimeConsumed: this.player2TimeConsumed },
      }),
    );

    if (this.board.isGameOver()) {
      const result = this.board.isDraw()
      ? GameResult.DRAW
      : this.board.turn() === 'b'
        ? GameResult.WHITE_WINS
        : GameResult.BLACK_WINS;
        
      this.endGame(GameStatus.COMPLETED, result);
    }

    this.moveCount++;
  }

  getPlayer1TimeConsumed() {
    if (this.board.turn() === 'w') {
      return this.player1TimeConsumed + (new Date(Date.now()).getTime() - new Date(this.lastMoveTime).getTime());
    }
    return this.player1TimeConsumed;
  }

  getPlayer2TimeConsumed() {
    if (this.board.turn() === 'b') {
      return this.player2TimeConsumed + (new Date(Date.now()).getTime() - new Date(this.lastMoveTime).getTime());
    }
    return this.player2TimeConsumed;
  }

  async resetAbandonTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.endGame(GameStatus.ABANDONED, this.board.turn() === 'b' ? GameResult.WHITE_WINS : GameResult.BLACK_WINS);
    }, 60 * 1000);
  }

  async resetMoveTimer() {
    if (this.moveTimer) {
      clearTimeout(this.moveTimer)
    }
    const turn = this.board.turn();
    const timeLeft = GAME_TIME_MS - (turn === 'w' ? this.player1TimeConsumed : this.player2TimeConsumed);

    this.moveTimer = setTimeout(() => {
      this.endGame(GameStatus.TIME_UP, turn === 'b' ? GameResult.WHITE_WINS : GameResult.BLACK_WINS);
    }, timeLeft);
  }

  async exitGame(user : User) {
    this.endGame(GameStatus.PLAYER_EXIT, user.userId === this.player2UserId ? GameResult.WHITE_WINS : GameResult.BLACK_WINS);
    
  }

  // change
  async draw(user : User) {
    this.endGame(GameStatus.COMPLETED, GameResult.DRAW)
  }

  async endGame(status: GameStatus, result: GameResult) {
    await transcationUpdate(`UPDATE Game SET status = '${status}', result = '${result}', endAt = CURRENT_TIMESTAMP() WHERE id = '${this.gameId}'`);
    const updatedGame = await update(`SELECT * FROM Game WHERE id = '${this.gameId}'`);
    const allMoves = await findMany(`SELECT * FROM Move WHERE gameId = '${updatedGame?.id}' ORDER BY moveNumber ASC`);
    const whitePlayer = await update(`SELECT * FROM User WHERE id = '${updatedGame?.whitePlayerId}'`);
    const blackPlayer = await update(`SELECT * FROM User WHERE id = '${updatedGame?.blackPlayerId}'`);
    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: GAME_ENDED,
        payload: {
          result,
          status,
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
      }),
    );
    // clear timers
    this.clearTimer();
    this.clearMoveTimer();
  }

  clearMoveTimer() {
    if(this.moveTimer) clearTimeout(this.moveTimer);
  }

  setTimer(timer: NodeJS.Timeout) {
    this.timer = timer;
  }

  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
  }
}

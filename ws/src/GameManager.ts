import { WebSocket } from "ws";
import { Game } from "./Game";
import { socketManager, User } from './SocketManager';
import { update } from './modules/src/db';
import { 
    INIT_GAME,
    MOVE,
    JOIN_ROOM,
    GAME_JOINED,
    GAME_NOT_FOUND,
    GAME_ALERT,
    GAME_ADDED,
    GAME_ENDED,
    EXIT_GAME,
    GameStatus, 
    DRAW,
    IS_DRAW,
    DO_DRAW,
    EXIT
    } from "./modules/src/Message";

export class GameManager{
    private games: Game[];
    private pendingGameId: string | null;
    private users: User[];

    constructor(){
        this.games = [];
        this.pendingGameId = null;
        this.users = [];
    }

    addUser(user: User){
        this.users.push(user);
        this.userHandler(user);
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find((user) => user.socket === socket);
        if (!user) {
          console.error('User not found?');
          return;
        }
        this.users = this.users.filter((user) => user.socket !== socket);
        socketManager.removeUser(user);
      }
    
    removeGame(gameId: string) {
        this.games = this.games.filter((g) => g.gameId !== gameId);
    }

    removePendingGame(gameId: string) {
      this.games = this.games.filter((g) => g.gameId !== gameId);
      this.pendingGameId = null;
    }

    private userHandler(user: User){
        user.socket.on("message", async (data)=>{
            const message = JSON.parse(data.toString());
            
            if(message.type === INIT_GAME){
                if(this.pendingGameId){
                    //start the game
                    const game = this.games.find((x) => x.gameId === this.pendingGameId);
                    if (!game) {
                        console.error('Pending game not found?');
                        return;
                    }

                    if(user.userId === game.player1UserId){
                        socketManager.broadcast(
                            game.gameId,
                            JSON.stringify({
                              type: GAME_ALERT,
                              payload: {
                                message: 'Trying to Connect with yourself?',
                              },
                            }),
                          );
                          return;
                    }
                    socketManager.addUser(user, game.gameId);
                    await game?.updateSecondPlayer(user.userId);
                    this.pendingGameId = null;
                }
                else{
                    const game = new Game(user.userId, null);
                    this.games.push(game);
                    this.pendingGameId = game.gameId;
                    socketManager.addUser(user, game.gameId);
                    socketManager.broadcast(
                    game.gameId,
                    JSON.stringify({
                        type: GAME_ADDED,
                        gameId:game.gameId,
                    }),
                    );
                }
            }

            if(message.type === MOVE){
                const gameId = message.payload?.gameId;
                const game = this.games.find((game) => game.gameId === gameId);
                if(game){
                    game.makeMove(user, message.payload.move);
                    if (game.result) {
                        this.removeGame(game.gameId);
                    }
                }
            }

            if (message.type === EXIT_GAME || message.type === DRAW){
                const gameId = message.payload.gameId;
                const game = this.games.find((game) => game.gameId === gameId); 
                if (game) {
                  await message.type === EXIT_GAME ? game.exitGame(user) : game.draw(user);
                  this.removeGame(game.gameId)
                }
            }

            // if user want to cancel game before any user joined the room
            if (message.type === EXIT) {
              const gameId = message.payload.gameID;
              const game = this.games.find((game) => game.gameId === gameId); 
              if (game) {
                this.removePendingGame(game.gameId)
              }
            }
            
            // send draw request to opponent
            if (message.type === DO_DRAW) {
              const gameId = message.payload?.gameID;
              const game =this.games.find((g) => g.gameId === gameId);
              const oppPlayer = user.userId === game?.player1UserId ? game?.player2UserId : game?.player1UserId;

              socketManager.ask(oppPlayer, gameId,
                JSON.stringify({
                  type: IS_DRAW,
                })
              )
            }
            
            if (message.type === JOIN_ROOM) {
                const gameId = message.payload?.gameId;
                if (!gameId) {
                  return;
                }
        
                let availableGame = this.games.find((game) => game.gameId === gameId);
                const gameFromDb = await update(`SELECT * FROM Game WHERE id = '${gameId}'`); 
                const whitePlayer = await update(`SELECT * FROM User WHERE id = '${gameFromDb.whitePlayerId}'`);
                const blackPlayer = await update(`SELECT * FROM User WHERE id = '${gameFromDb.blackPlayerId}'`);
                const moves = await update(`SELECT * FROM Move WHERE gameId = '${gameFromDb?.id}' ORDER BY moveNumber ASC`);
                // There is a game created but no second player available
        
                if (availableGame && !availableGame.player2UserId) {
                    socketManager.addUser(user, availableGame.gameId);
                    await availableGame.updateSecondPlayer(user.userId);
                    return;
                }

                //if we didn't find game in database
                if (!gameFromDb) {
                    user.socket.send(
                      JSON.stringify({
                        type: GAME_NOT_FOUND,
                      }),
                    );
                    return;
                  }

                  if(gameFromDb.status !== GameStatus.IN_PROGRESS) {
                    user.socket.send(JSON.stringify({
                      type: GAME_ENDED,
                      payload: {
                        result: gameFromDb.result,
                        status: gameFromDb.status,
                        moves: moves,
                        blackPlayer: {
                          id: gameFromDb.blackPlayerId,
                          name: blackPlayer.name,
                        },
                        whitePlayer: {
                          id: gameFromDb.whitePlayerId,
                          name: whitePlayer.name,
                        },
                      }
                    }));
                    return;
                  }

                  if (!availableGame) {
                    const game = new Game(
                      gameFromDb.whitePlayerId!,
                      gameFromDb.blackPlayerId!,
                      gameFromDb.id,
                      gameFromDb.startAt,
                    );
                    
                    game.seedMoves((moves) || []);
                    this.games.push(game);
                    availableGame = game;
                  }
          
                  console.log(availableGame.getPlayer1TimeConsumed());
                  console.log(availableGame.getPlayer2TimeConsumed());
          
                  user.socket.send(
                    JSON.stringify({
                      type: GAME_JOINED,
                      payload: {
                        gameId,
                        moves: moves,
                        blackPlayer: {
                          id: gameFromDb.blackPlayerId,
                          name: blackPlayer?.name,
                        },
                        whitePlayer: {
                          id: gameFromDb.whitePlayerId,
                          name: whitePlayer?.name,
                        },
                        player1TimeConsumed: availableGame.getPlayer1TimeConsumed(),
                        player2TimeConsumed: availableGame.getPlayer2TimeConsumed(),
                      },
                    }),
                  );
          
                socketManager.addUser(user, gameId);
            }
        
        });
    }
}

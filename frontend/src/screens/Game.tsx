import { useEffect, useRef, useState } from 'react';
import { Button } from "../components/Button";
import { ChessBoard, isPromoting } from "../components/chessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess , Move} from "chess.js";
import { GameResult as Result, INIT_GAME, GAME_OVER, MOVE, JOIN_ROOM, GAME_JOINED , GAME_ADDED, USER_TIMEOUT, GAME_TIME, GAME_ENDED, EXIT_GAME, DRAW, IS_DRAW, DO_DRAW, EXIT} 
from "../lib/Message.ts";
import { GAME_TIME_MS } from '../lib/const.ts';
import { useUser } from '../hooks/useUser.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { movesAtom, userSelectedMoveIndexAtom } from '../atoms/chessBoard.ts'
import { useRecoilValue, useSetRecoilState } from 'recoil';
import GameEndModal from '../components/GameEndModal.tsx';
import { UserAvatar } from '../components/UserAvatar.tsx';
import { ShareGame } from '../components/ShareGame.tsx';
import { Waitopponent } from '../components/ui/Waitopponent.tsx';
import ExitGameModel from '../components/ExitGameModal.tsx';
import MovesTable from '../components/MovesTable.tsx';
import DrawModel from '../components/DrawModal.tsx';
import { Loader } from 'lucide-react';
import { usePersistance } from '../hooks/usePersistance.ts';

export interface GameResult {
    result: Result;
    by: string;
}

export interface Player {
    id: string;
    name: string;
    isGuest: boolean;
}

export interface Metadata {
    blackPlayer: Player;
    whitePlayer: Player;
}

export function Game(){
    const socket = useSocket();
    const { gameId } = useParams();
    const user = useUser();

    const navigate = useNavigate()
    
    const [chess, _setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [added, setAdded] = usePersistance(false, gameId);
    const [started, setStarted] = useState(false);
    const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
    const [result, setResult] = useState<GameResult | null>(null);
    const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
    const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
    const [gameID,setGameID] = useState("");
    const [isDraw, setIsDraw] = useState(false);
    const setMoves = useSetRecoilState(movesAtom);
    const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
    const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

    useEffect(() => {
        userSelectedMoveIndexRef.current = userSelectedMoveIndex;
    }, [userSelectedMoveIndex]);
    
    useEffect(() => {
        if (!user) {
          cancelGame();
          localStorage.removeItem(`added:${gameId}`);
          navigate(`/login`);
        }else {
          console.log(user);
        }
    }, [user]);
    
    useEffect(() => {
        if (!socket) {
          return;
        }
        socket.onmessage = function (event) {
          const message = JSON.parse(event.data);
          switch (message.type) {
            case GAME_ADDED:
              setAdded(true);
              setGameID(()=>message.gameId);
              break;
            case INIT_GAME:
              setBoard(chess.board());
              setStarted(true);
              setGameMetadata({
                blackPlayer: message.payload.blackPlayer,                
                whitePlayer: message.payload.whitePlayer,
              });
              navigate(`/game/${message.payload.gameId}`);
              
              break;
            case MOVE:
             
              const { move, player1TimeConsumed, player2TimeConsumed } =
                message.payload;
              setPlayer1TimeConsumed(player1TimeConsumed);
              setPlayer2TimeConsumed(player2TimeConsumed);
              if (userSelectedMoveIndexRef.current !== null) {
                setMoves((moves) => [...moves, move]);
                return;
              }

              try {
                if (isPromoting(chess, move.from, move.to)) {
                  chess.move({
                    from: move.from,
                    to: move.to,
                    promotion: 'q',
                  });
                } else {
                  chess.move({ from: move.from, to: move.to });
                }
                setMoves((moves) => [...moves, move]);
                
              } catch (error) {
                console.log('Error', error);
              }
              break;
            case GAME_OVER:
              setResult(message.payload.result);
              break;
    
            case GAME_ENDED:
              let wonBy;
              switch (message.payload.status) {
                case 'COMPLETED':
                  wonBy = message.payload.result !== 'DRAW' ? 'CheckMate' : 'Draw';
                  break;
                case 'PLAYER_EXIT':
                  wonBy = 'Player Exit';
                  break;
                default:
                  wonBy = 'Timeout';
              }
              setResult({
                result: message.payload.result,
                by: wonBy,
              });
              
              chess.reset();
              setStarted(false);
              localStorage.removeItem(`added:${gameId}`);
              setAdded(false);
              
              break;
    
            case USER_TIMEOUT:
              setResult(message.payload.win);
              break;
              
             
            case IS_DRAW:
              setIsDraw(true);
              break;

            case GAME_JOINED:
              setGameMetadata({
                blackPlayer: message.payload.blackPlayer,
                whitePlayer: message.payload.whitePlayer,
              });
              setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
              setPlayer2TimeConsumed(message.payload.player2TimeConsumed);
              console.error(message.payload);
              setStarted(true);
    
              message.payload.moves.map((x: Move) => {
                if (isPromoting(chess, x.from, x.to)) {
                  chess.move({ ...x, promotion: 'q' });
                } else {
                  chess.move(x);
                }
              });
              setMoves(message.payload.moves);
              break;
    
            case GAME_TIME:
              setPlayer1TimeConsumed(message.payload.player1Time);
              setPlayer2TimeConsumed(message.payload.player2Time);
              break;
    
            default:
              alert(message.payload.message);
              break;
          }
        };
    
        if (gameId !== 'random') {
          socket.send(
            JSON.stringify({
              type: JOIN_ROOM,
              payload: {
                gameId,
              },
            }),
          );
        }
    }, [chess, socket]);

    useEffect(() => {
        if (started) {
          const interval = setInterval(() => {
            if (chess.turn() === 'w') {
              setPlayer1TimeConsumed((p) => p + 100);
            } else {
              setPlayer2TimeConsumed((p) => p + 100);
            }
          }, 100);
          return () => clearInterval(interval);
        }
      }, [started, gameMetadata, user]);
    
        const getTimer = (timeConsumed: number) => {
            const timeLeftMs = GAME_TIME_MS - timeConsumed;
            const minutes = Math.floor(timeLeftMs / (1000 * 60));
            const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
    
            return (
            <div className="text-white">
                Time Left: {minutes < 10 ? '0' : ''}
                {minutes}:{remainingSeconds < 10 ? '0' : ''}
                {remainingSeconds}
            </div>
            );
        };
    
        const handleExit = (msg: string) => {
            socket?.send(
                JSON.stringify({
                    type: msg,
                    payload: {
                        gameId,
                    },
                }),
            );
            setMoves([]);
            navigate("/");
        };

        // cancel game before any opponent join
        const cancelGame = () => {
          socket?.send(
            JSON.stringify({
                type: EXIT,
                payload: {
                    gameID,
                },
            }),
        );
        setAdded(false);
        setGameID('');
        }

        // handle draw from the one who suggest it 
        const handleDraw = () => {
          socket?.send(
            JSON.stringify({
              type: DO_DRAW,
              payload: {
                gameID
              }
            })
          )
        }
  

    if(!socket) return <div className="text-white flex justify-center text-4xl pt-20"><Loader/></div>
    return (
        <div>
          
          {isDraw && (
            <DrawModel onClick={() => handleExit(DRAW)}></DrawModel>
          )}
            
          {result && (
            <GameEndModal
              blackPlayer={gameMetadata?.blackPlayer}
              whitePlayer={gameMetadata?.whitePlayer}
              gameResult={result}
            ></GameEndModal>
          )}
      
      {started && (
        <div className="justify-center flex pt-4 text-white">
          {(user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
          chess.turn()
            ? 'Your turn'
            : "Opponent's turn"}
        </div>
      )}
      <div className="justify-center flex">
        <div className="pt-2 w-full">
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="text-white">
              <div className="flex justify-center">
                <div>
                  {started && (
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <UserAvatar gameMetadata={gameMetadata} />
                        {getTimer(
                          user.id === gameMetadata?.whitePlayer?.id
                            ? player2TimeConsumed
                            : player1TimeConsumed,
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className={`w-full flex justify-center text-white`}>
                      <ChessBoard
                        started={started}
                        gameId={gameId ?? ''}
                        myColor={
                          user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'
                        }
                        chess={chess}
                        setBoard={setBoard}
                        socket={socket}
                        msg={null}
                        board={board}
                      />
                    </div>
                  </div>
                  {started && (
                    <div className="mt-4 flex justify-between">
                      <UserAvatar gameMetadata={gameMetadata} self />
                      {getTimer(
                        user.id === gameMetadata?.blackPlayer?.id
                          ? player2TimeConsumed
                          : player1TimeConsumed,
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-md pt-2 flex-1 overflow-auto h-[95vh] overflow-y-scroll no-scrollbar bg-white">
              {!started ? (
                <div className="pt-8 flex justify-center w-full">
                  {added ? (
                    <div className='flex flex-col items-center space-y-4 justify-center'>
                      <div className="text-white"><Waitopponent/></div>
                      <ShareGame gameId={gameID}/>
                      <Button onClick={() => cancelGame()} content="Cancel"></Button>
                    </div>
                  ) : (
                    gameId === 'random' && (
                      <Button
                        onClick={() => {
                          socket.send(
                            JSON.stringify({
                              type: INIT_GAME,
                            }),
                          );
                        }} content="Play"
                      />
                    )
                  )}
                </div>
              ) : (
                <div>
                  <div className="p-8 flex justify-center w-full">
                    <ExitGameModel onClick={() => handleExit(EXIT_GAME)} name={'Exit'} />
                  </div>
                
                  <MovesTable resign={<ExitGameModel onClick={() => handleExit(EXIT_GAME)} name={'Resign'} />} 
                  handleDraw={() => handleDraw()}/>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
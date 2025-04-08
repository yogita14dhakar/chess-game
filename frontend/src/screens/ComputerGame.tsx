import { useEffect, useMemo, useRef, useState } from 'react';
// import { Button } from "../components/Button";
import { ChessBoard, isPromoting } from "../components/chessBoard";
import { getBestMove } from './computerMove.ts';
import { Chess } from "chess.js";
import { GameResult as Result,  MOVE , GameStatus} 
from "../modules/src/Message.ts";
import { GAME_TIME_MS } from '../modules/const';
import { useUser } from '../modules/src/hooks/useUser.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { movesAtom, userSelectedMoveIndexAtom } from '../modules/src/atoms/chessBoard.ts'
import { useRecoilValue, useSetRecoilState } from 'recoil';
import MoveSound from '/move.mp3';
import Notify from '/notify.mp3';
import GameEndModal from '../components/GameEndModal.tsx';
import { UserAvatar } from '../components/UserAvatar.tsx';
import ExitGameModel from '../components/ExitGameModal.tsx';
import MovesTable from '../components/MovesTable.tsx';
import { BACKEND_URL } from '../modules/src/atoms/user.ts';

const moveAudio = new Audio(MoveSound);
const NotifyAudio = new Audio(Notify);

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

export function ComputerGame(){
    
  const { gameId } = useParams();
  const user = useUser();
  const navigate = useNavigate()
    
      function usePersistance(init_val:boolean) {
        // Set initial value
        const initial_value = useMemo(() => {
          const local_storage_value = localStorage.getItem('added:');
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
          localStorage.setItem('added:', state_str) // Set stringified state as item in localStorage
        }, [added]);
  
        return [added, setAdded];
      }
  const [added, setAdded] = usePersistance(false);
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const setMoves = useSetRecoilState(movesAtom);
  let timer: NodeJS.Timeout | null = null;
  let moveTimer: NodeJS.Timeout | null = null;
  const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
  const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

  useEffect(() => {
      userSelectedMoveIndexRef.current = userSelectedMoveIndex;
  }, [userSelectedMoveIndex]);
    
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('added:');
      navigate(`/login`);
    }
  }, [user]);
    
  async function resetAbandonTimer() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      endGame(GameStatus.ABANDONED, chess.turn() === 'b' ? Result.WHITE_WINS : Result.BLACK_WINS);
    }, 60 * 1000);
  }

  async function resetMoveTimer() {
    if (moveTimer) {
      clearTimeout(moveTimer)
    }
    const turn =chess.turn();
    const timeLeft = GAME_TIME_MS - (turn === 'w' ? player1TimeConsumed : player2TimeConsumed);

    moveTimer = setTimeout(() => {
      endGame(GameStatus.TIME_UP, turn === 'b' ? Result.WHITE_WINS : Result.BLACK_WINS);
    }, timeLeft);
  }
    const createGame = async() => {
      setAdded(true);
      const response = await fetch(`${BACKEND_URL}/computer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gameId: gameId,
          user: user.id
        }),
      });
      console.log("fetched");
      const game = await response.json();
      console.log(game);
      setBoard(chess.board());
      setGameMetadata({
        blackPlayer: game.payload.blackPlayer,                
        whitePlayer: game.payload.whitePlayer,
      });
      
      console.log("set true");
      NotifyAudio.play();
      return;
    }
    
    const endGame = async(status: GameStatus, result: Result) => {
      // await fetch(`${BACKEND_URL}/computer/end`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   credentials: 'include',
      //   body: JSON.stringify({
      //     gameId: gameId,
      //     status: status,
      //     result: result,
      //   }),
      // });
        let wonBy;
          switch (status) {
            case 'COMPLETED':
              wonBy = result !== 'DRAW' ? 'CheckMate' : 'Draw';
              break;
            case 'PLAYER_EXIT':
              wonBy = 'Player Exit';
              break;
            default:
              wonBy = 'Timeout';
          }
          setResult({
            result: result,
            by: wonBy,
          });
          
          chess.reset();
          localStorage.removeItem('added:');
          setAdded(false);
      
          NotifyAudio.play();
          if (timer) clearTimeout(timer);
          if(moveTimer) clearTimeout(moveTimer);
      setMoves([]);
    }

      const computerMove = async() => {
        
        // const response = await fetch(`${BACKEND_URL}/computer/move`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   credentials: 'include',
        //   body: JSON.stringify({
        //     gameId: gameId,
        //     chess: chess,
        //     moveTimeStamp: new Date(Date.now())
        //   }),
        // });

        // const move = await response.json();
        const bestMove = getBestMove(chess, 4);
        
        resetAbandonTimer()
        resetMoveTimer();
    
        if (userSelectedMoveIndexRef.current !== null) {
          setMoves((moves) => [...moves, ]);
          return;
        }
  
        try {
          if (isPromoting(chess, bestMove.from, bestMove.to)) {
            chess.move({
              from: bestMove.from,
              to: bestMove.to,
              promotion: 'q',
            });
          }else {
            chess.move({ from: bestMove.from, to: bestMove.to });
          }
          setMoves((moves) => [...moves, bestMove]);
          moveAudio.play();
            
        }catch (error) {
          console.log('Error', error);
        }
        if (chess.isGameOver()) {
          const res = chess.isDraw()
          ? Result.DRAW
          : chess.turn() === 'b'
            ? Result.WHITE_WINS
            : Result.BLACK_WINS;
            endGame(GameStatus.COMPLETED, res);
        }
        return;
      }

    //create game in database
    !added && createGame();
    //add move to database and bot move bring from backend
    if(chess.turn() === 'b'){computerMove()}

    const msg = async function (event:any){
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MOVE: 
        let move = message.payload.move;
        // const response = await fetch(`${BACKEND_URL}/computer/add`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   credentials: 'include',
        //   body: JSON.stringify({
        //     gameId: gameId,
        //     move: move,
        //     movecount: moves.length,
        //     player1TimeConsumed: player1TimeConsumed,
        //     player2TimeConsumed: player2TimeConsumed,
        //     moveTimeStamp: new Date(Date.now())
        //   }),
        // });
        // const timeConsumed = await response.json();
        // setPlayer1TimeConsumed(timeConsumed.player1);
        resetAbandonTimer()
        resetMoveTimer();
    
        if (userSelectedMoveIndexRef.current !== null) {
          setMoves((moves) => [...moves, ]);
          return;
        }
  
        try {
          if (isPromoting(chess, move.from, move.to)) {
            chess.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
          }else {
            chess.move({ from: move.from, to: move.to });
          }
          setMoves((moves) => [...moves, move]);
          moveAudio.play();
            
        }catch (error) {
          console.log('Error', error);
        }
        if (chess.isGameOver()) {
          const res = chess.isDraw()
          ? Result.DRAW
          : chess.turn() === 'b'
            ? Result.WHITE_WINS
            : Result.BLACK_WINS;
            endGame(GameStatus.COMPLETED, res);
        }
        break;
        // case GAME_OVER:
        //   setResult(message.payload.result);
        //   NotifyAudio.play();
        //   break;

        // case GAME_ENDED:
        //   let wonBy;
        //   switch (message.payload.status) {
        //     case 'COMPLETED':
        //       wonBy = message.payload.result !== 'DRAW' ? 'CheckMate' : 'Draw';
        //       break;
        //     case 'PLAYER_EXIT':
        //       wonBy = 'Player Exit';
        //       break;
        //     default:
        //       wonBy = 'Timeout';
        //   }
        //   setResult({
        //     result: message.payload.result,
        //     by: wonBy,
        //   });
          
        //   chess.reset();
        //   localStorage.removeItem('added:');
        //   setAdded(false);
      
        //   NotifyAudio.play();
        //   break;

        // case USER_TIMEOUT:
        //   setResult(message.payload.win);
        //   break;
          

        default:
          alert(message.payload.message);
          break;
      }
    };
    
    useEffect(() => {
        
          const interval = setInterval(() => {
            if (chess.turn() === 'w') {
              setPlayer1TimeConsumed((p) => p + 100);
            } else {
              setPlayer2TimeConsumed((p) => p + 100);
            }
          }, 100);
          return () => clearInterval(interval);
    }, [gameMetadata, user]);
    
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
    

    return (
        added ? <div>
            
          {result && (
            <GameEndModal
              blackPlayer={gameMetadata?.blackPlayer}
              whitePlayer={gameMetadata?.whitePlayer}
              gameResult={result}
            ></GameEndModal>
          )}
      
      
        {added && <div className="justify-center flex pt-4 text-white">
          {(user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
          chess.turn()
            ? 'Your turn'
            : "Opponent's turn"}
        </div>}
      <div className="justify-center flex">
        <div className="pt-2 w-full">
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="text-white">
              <div className="flex justify-center">
                <div>
                  
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <UserAvatar gameMetadata={gameMetadata} />
                        {getTimer(
                          player2TimeConsumed
                        )}
                      </div>
                    </div>
                  
                  <div>
                    <div className={`w-full flex justify-center text-white`}>
                      <ChessBoard
                        started={true}
                        gameId={gameId ?? ''}
                        myColor={
                          user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'
                        }
                        chess={chess}
                        setBoard={setBoard}
                        socket={null}
                        msg={msg}
                        board={board}
                      />
                    </div>
                  </div>
                    <div className="mt-4 flex justify-between">
                      <UserAvatar gameMetadata={gameMetadata} self={true} />
                      {getTimer(
                        player1TimeConsumed,
                      )}
                    </div>
                </div>
              </div>
            </div>
            <div className="rounded-md pt-2 flex-1 overflow-auto h-[95vh] overflow-y-scroll no-scrollbar bg-white">
                <div>
                  <div className="p-8 flex justify-center w-full">
                    <ExitGameModel onClick={() => endGame(GameStatus.PLAYER_EXIT, chess.turn() === 'w' ? Result.BLACK_WINS : Result.WHITE_WINS)} name={'Exit'} />
                  </div>
                
                  <MovesTable resign={<ExitGameModel onClick={() => endGame(GameStatus.PLAYER_EXIT, chess.turn() === 'w' ? Result.BLACK_WINS : Result.WHITE_WINS)} name={'Resign'} />} 
                  handleDraw={() => null}/>
                </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div> : <h1>welcome to the game!!!</h1>
  );
};
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "../components/Button";
import { ChessBoard, isPromoting } from "../components/chessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess , Move} from "chess.js";
import { GameResult as Result, INIT_GAME, GAME_OVER, MOVE, JOIN_ROOM, GAME_JOINED , GAME_ADDED, USER_TIMEOUT, GAME_TIME, GAME_ENDED, EXIT_GAME, DRAW, IS_DRAW, DO_DRAW, EXIT} 
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
import DrawModel from '../components/DrawModal.tsx';
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
    

    const [chess, _setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
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
      console.log('useeffect', user);
        if (!user) {
          navigate(`/login`);
        }
    }, [user]);
    
    // //create game in database
    // const createGame = async() => {
    //   const response = await fetch(`${BACKEND_URL}/computer`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     credentials: 'include',
    //     body: JSON.stringify({
    //       gameId: gameId,
    //       user: user.id
    //     }),
    //   });
    //   const game = await response.json();
    //   setGameID(game.gameId);
    //   setBoard(chess.board());
    //   setGameMetadata({
    //     blackPlayer: game.payload.blackPlayer,                
    //     whitePlayer: game.payload.whitePlayer,
    //   });
    //   NotifyAudio.play();
    // }
    
    // user && createGame();
    // const msg = function (event:any){
    //   const message = JSON.parse(event.data);
    //   switch (message.type) {
    //     case MOVE:
         
    //       const { move, player1TimeConsumed, player2TimeConsumed } =
    //         message.payload;
    //       setPlayer1TimeConsumed(player1TimeConsumed);
    //       setPlayer2TimeConsumed(player2TimeConsumed);
    //       if (userSelectedMoveIndexRef.current !== null) {
    //         setMoves((moves) => [...moves, move]);
    //         return;
    //       }

    //       try {
    //         if (isPromoting(chess, move.from, move.to)) {
    //           chess.move({
    //             from: move.from,
    //             to: move.to,
    //             promotion: 'q',
    //           });
    //         } else {
    //           chess.move({ from: move.from, to: move.to });
    //         }
    //         setMoves((moves) => [...moves, move]);
    //         moveAudio.play();
            
    //       } catch (error) {
    //         console.log('Error', error);
    //       }
    //       break;
    //     case GAME_OVER:
    //       setResult(message.payload.result);
    //       NotifyAudio.play();
    //       break;

    //     case GAME_ENDED:
    //       let wonBy;
    //       switch (message.payload.status) {
    //         case 'COMPLETED':
    //           wonBy = message.payload.result !== 'DRAW' ? 'CheckMate' : 'Draw';
    //           break;
    //         case 'PLAYER_EXIT':
    //           wonBy = 'Player Exit';
    //           break;
    //         default:
    //           wonBy = 'Timeout';
    //       }
    //       setResult({
    //         result: message.payload.result,
    //         by: wonBy,
    //       });
          
    //       chess.reset();
     
    //       localStorage.removeItem('added:');
      
    //       NotifyAudio.play();
    //       break;

    //     case USER_TIMEOUT:
    //       setResult(message.payload.win);
    //       break;
          
         
    //     case IS_DRAW:
    //       setIsDraw(true);
    //       break;

    //     default:
    //       alert(message.payload.message);
    //       break;
    //   }
    // };
    
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
    
        const handleExit = (msg: string) => {
            
            setMoves([]);
            navigate("/");
        };


  
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
      
      
        <div className="justify-center flex pt-4 text-white">
          {(user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
          chess.turn()
            ? 'Your turn'
            : "Opponent's turn"}
        </div>
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
                          user.id === gameMetadata?.whitePlayer?.id
                            ? player2TimeConsumed
                            : player1TimeConsumed,
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
                        msg={null}
                        board={board}
                      />
                    </div>
                  </div>
                    <div className="mt-4 flex justify-between">
                      <UserAvatar gameMetadata={gameMetadata} self />
                      {getTimer(
                        user.id === gameMetadata?.blackPlayer?.id
                          ? player2TimeConsumed
                          : player1TimeConsumed,
                      )}
                    </div>
                </div>
              </div>
            </div>
            <div className="rounded-md pt-2 flex-1 overflow-auto h-[95vh] overflow-y-scroll no-scrollbar bg-white">
                <div>
                  <div className="p-8 flex justify-center w-full">
                    <ExitGameModel onClick={() => handleExit(EXIT_GAME)} name={'Exit'} />
                  </div>
                
                  <MovesTable resign={<ExitGameModel onClick={() => handleExit(EXIT_GAME)} name={'Resign'} />} 
                  handleDraw={() => null}/>
                </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
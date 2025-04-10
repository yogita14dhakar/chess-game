import { useEffect, useRef, useState } from 'react';
import { ChessBoard, isPromoting } from "../components/chessBoard";
import { getBestMove } from '../hooks/computerMove.ts';
import { Chess } from "chess.js";
import { GameResult as Result,  MOVE , GameStatus} 
from "../lib/Message.ts";
import { GAME_TIME_MS } from '../lib/const.ts';
import { useUser } from '../hooks/useUser.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { movesAtom, userSelectedMoveIndexAtom } from '../atoms/chessBoard.ts'
import { useRecoilValue, useSetRecoilState } from 'recoil';
import GameEndModal from '../components/GameEndModal.tsx';
import { UserAvatar } from '../components/UserAvatar.tsx';
import ExitGameModel from '../components/ExitGameModal.tsx';
import MovesTable from '../components/MovesTable.tsx';
import { Loader } from '../components/Loader.tsx';
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

export function ComputerGame(){
    
  const { gameId } = useParams();
  const user = useUser();
  const navigate = useNavigate();
    
  const [added, setAdded] = usePersistance(false,gameId);
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const setMoves = useSetRecoilState(movesAtom);
  const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
  const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);
  const timer = useRef<NodeJS.Timeout | null> (null);
  let moveTimer = useRef<NodeJS.Timeout | null> (null);
  let lastMoveTime = new Date(Date.now());

  useEffect(() => {
      userSelectedMoveIndexRef.current = userSelectedMoveIndex;
  }, [userSelectedMoveIndex]);
    
  useEffect(() => {
    if (!user) {
      localStorage.removeItem(`added:${gameId}`);
      navigate(`/login`);
    }
  }, [user]);
  
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

  useEffect(() => {
    if (!added) {
      createGame();
    }
  }, [added]);

  async function resetAbandonTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      endGame(GameStatus.ABANDONED, chess.turn() === 'b' ? Result.WHITE_WINS : Result.BLACK_WINS);
    }, 60 * 1000);
  }

  async function resetMoveTimer() {
    if (moveTimer.current) {
      clearTimeout(moveTimer.current)
    }
    const turn =chess.turn();
    const timeLeft = GAME_TIME_MS - (turn === 'w' ? player1TimeConsumed : player2TimeConsumed);

    moveTimer.current = setTimeout(() => {
      endGame(GameStatus.TIME_UP, turn === 'b' ? Result.WHITE_WINS : Result.BLACK_WINS);
    }, timeLeft);
  }

  const createGame = async() => {
    const game = {
      gameId:gameId,
      payload: {
        blackPlayer: {
          name: `computer`,
          id: `computer`,
          isGuest: false
        },
        whitePlayer: {
          name: user.name,
          id: user.id,
          isGuest: false 
        }
      }
    }
    setGameMetadata({
      blackPlayer: game.payload.blackPlayer,                
      whitePlayer: game.payload.whitePlayer,
    });
    setAdded(true);
    setBoard(chess.board());
    return;
  }
    
  const endGame = async(status: GameStatus, result: Result) => {
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
    localStorage.removeItem(`added:${gameId}`);
    setAdded(false);
    if (timer.current) clearTimeout(timer.current);
    if(moveTimer.current) clearTimeout(moveTimer.current);
    setMoves([]);
    if(status === 'PLAYER_EXIT') navigate('/');
  }

  const msg = function (event:any){
    const message = event;
    switch (message.type) {
      case MOVE:     
        const move = message.payload.move;
        if (result) {
          console.error(`User is making a move post game completion`);
          return;
        }
        const moveTimestamp = new Date(Date.now());
        // flipped because move has already happened
        if (chess.turn() === 'b') {
          setPlayer1TimeConsumed(player1TimeConsumed + (moveTimestamp.getTime() - new Date(lastMoveTime).getTime()));
        }

        if (chess.turn() === 'w') {
          setPlayer2TimeConsumed(player2TimeConsumed + (moveTimestamp.getTime() - new Date(lastMoveTime).getTime()));
        }
        resetAbandonTimer()
        resetMoveTimer();
        lastMoveTime = moveTimestamp;
        if (userSelectedMoveIndexRef.current !== null) {
          setMoves((moves) => [...moves, move]);
          return;
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
      default:
        alert(message.payload.message);
      break;
    }
  };

  //bot move
    if (chess.turn() === 'b' && !result) {
      const bestMove = getBestMove(chess, 4);
      try {
        if (isPromoting(chess, bestMove.from, bestMove.to)) {
          chess.move({
            from: bestMove.from,
            to: bestMove.to,
            promotion: 'q',
          });
        } else {
          chess.move({ from: bestMove.from, to: bestMove.to });
        }
        setMoves((moves) => [...moves, bestMove]);
      } catch (error) {
        console.log('Error', error);
      }
      msg({
        type:MOVE,
        payload: {
          move: bestMove
        }
      })
    }
      
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
    </div> : <div><Loader/></div>
  );
};
import { Chess, Move } from "chess.js";

interface EvalResult {
  move: Move | null;
  value: number;
}

const pieceValues: { [key: string]: number } = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 10000,
  P: -1, N: -3, B: -3, R: -5, Q: -9, K: -10000,
};

// Simplified Endgame Tablebase (Example for K+Q vs K)
const endgameTablebase: { [key: string]: number } = {
  'KQK': 10000, // Checkmate possible
  'Kk': -10000, // Stalemate or impossible to checkmate
};

// Time Control (10 second per move)
const TIME_LIMIT = 10000; // milliseconds

// Enhanced Evaluation Function with Positional Factors
function evaluateBoard(board: (string | null)[][]): number {
  let score = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        score += pieceValues[piece] || 0;
        // Center control bonus
        if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
          score += piece === piece.toUpperCase ? 0.5 : -0.5;
        }
      }
    }
  }
  return score;
}

// Check for Endgame Tablebase Position
function checkEndgameTablebase(chess: Chess): number {
  const key = chess.board().map(row => row.map(cell => cell || '.').join('')).join('');
  return endgameTablebase[key] || 0;
}

// Time-Controlled Minimax with Iterative Deepening
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  startTime: number,
  transpositionTable: Map<string, number>
): EvalResult {

  const key = chess.fen();

  // Check memoized result
  if (transpositionTable.has(key)) {
    return { move: null, value: transpositionTable.get(key)! };
  }

  if (depth === 0 || chess.isGameOver() || Date.now() - startTime > TIME_LIMIT) {
    const evalScore = evaluateBoard(chess.board() as (string | null)[][]) + checkEndgameTablebase(chess);
    transpositionTable.set(key, evalScore);
    return { move: null, value: evalScore };
  }

  let bestMove: Move | null = null;

  const moves = chess.moves({ verbose: true }).sort((a, b) => (pieceValues[b.captured || ''] || 0) - (pieceValues[a.captured || ''] || 0));

  if (maximizingPlayer) {
    let maxEval = -Infinity;

    for (const move of moves) {
      chess.move(move);;
      const result = minimax(chess, depth - 1, alpha, beta, false, startTime, transpositionTable);
      chess.undo();
      if (result.value > maxEval) {
        maxEval = result.value;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.value);
      
      if (beta <= alpha || Date.now() - startTime > TIME_LIMIT) break;
    }
    transpositionTable.set(key, maxEval);
    return { move: bestMove, value: maxEval };
  } else {
    let minEval = Infinity;

    for (const move of moves) {
      chess.move(move);;
      const result = minimax(chess, depth - 1, alpha, beta, true, startTime, transpositionTable);
      chess.undo();
      if (result.value < minEval) {
        minEval = result.value;
        bestMove = move;
      }

      beta = Math.min(beta, result.value);
      
      if (beta <= alpha || Date.now() - startTime > TIME_LIMIT) break;
    }
    transpositionTable.set(key, minEval);
    return { move: bestMove, value: minEval };
  }
}

// Best Move Selection with Time Management
export function getBestMove(chess: Chess, depth: number): any {
  const startTime = Date.now();
  const cache = new Map<string, number>();
  const { move , value } = minimax(chess, depth - 1, -Infinity, Infinity, false, startTime, cache);
  return move;
}


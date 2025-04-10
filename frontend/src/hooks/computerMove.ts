import { Chess } from "chess.js";

const pieceValues: { [key: string]: number } = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 10000,
  P: -1, N: -3, B: -3, R: -5, Q: -9, K: -10000,
};

// Simplified Endgame Tablebase (Example for K+Q vs K)
const endgameTablebase: { [key: string]: number } = {
  'KQK': 10000, // Checkmate possible
  'Kk': -10000, // Stalemate or impossible to checkmate
};

// Time Control (1 second per move)
const TIME_LIMIT = 1000; // milliseconds

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
  startTime: number
): number {
  if (depth === 0 || chess.isGameOver() || Date.now() - startTime > TIME_LIMIT) {
    return evaluateBoard(chess.board() as (string | null)[][]) + checkEndgameTablebase(chess);
  }

  const moves = chess.moves({ verbose: true }).sort((a, b) => (pieceValues[b.captured || ''] || 0) - (pieceValues[a.captured || ''] || 0));

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);;
      const eva = minimax(chess, depth - 1, alpha, beta, false, startTime);
      maxEval = Math.max(maxEval, eva);
      alpha = Math.max(alpha, eva);
      chess.undo();
      if (beta <= alpha || Date.now() - startTime > TIME_LIMIT) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);;
      const eva = minimax(chess, depth - 1, alpha, beta, true, startTime);
      minEval = Math.min(minEval, eva);
      beta = Math.min(beta, eva);
      chess.undo();
      if (beta <= alpha || Date.now() - startTime > TIME_LIMIT) break;
    }
    return minEval;
  }
}

// Best Move Selection with Time Management
export function getBestMove(chess: Chess, depth: number): any {
  let bestMove = null;
  let bestValue = -Infinity;
  const startTime = Date.now();

  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    const moveValue = minimax(chess, depth - 1, -Infinity, Infinity, false, startTime);
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
    chess.undo();
    if (Date.now() - startTime > TIME_LIMIT) break;
  }

  return bestMove;
}


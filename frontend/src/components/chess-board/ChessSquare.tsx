import { Color, PieceSymbol, Square } from 'chess.js';

const ChessSquare = ({
  square,
}: {
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  };
}) => {
  const w = screen.width > 540 && screen.height > 600 ? 'w-[2rem]' : 'w-[1rem]';
  return (
    
    <div className="h-full justify-center flex flex-col ">
      {square ? (
        <img
          className={w}
          src={`/${square?.color === 'b' ? `${square.type}` : `${square.type.toUpperCase()} copy`}.png`}
        />
      ) : null}
    </div>
  );
};

export default ChessSquare;
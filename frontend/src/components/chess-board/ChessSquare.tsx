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
  return (
    <div className="h-full justify-center flex flex-col ">
      {square ? (
        <img
          className="w-[2rem]"
          src={`/${square?.color === 'b' ? `${square.type}` : `${square.type.toUpperCase()} copy`}.png`}
        />
      ) : null}
    </div>
  );
};

export default ChessSquare;
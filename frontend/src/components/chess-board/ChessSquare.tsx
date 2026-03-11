import { Color, PieceSymbol, Square } from 'chess.js';
import { Cloudinary } from 'https://cdn.jsdelivr.net/npm/@cloudinary/url-gen/+esm';
import { AdvancedImage } from 'https://cdn.jsdelivr.net/npm/@cloudinary/react/+esm';

const ChessSquare = ({
  square,
}: {
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  };
}) => {
  const cld = new Cloudinary({ cloud: { cloudName: 'dcbp4dscm' } });
  const image = cld.image(`/${square?.color === 'b' ? `${square.type}` : `${square.type.toUpperCase()}_copy`}`)
  const w = screen.width > 540 && screen.height > 600 ? 'w-[2rem]' : 'w-[1rem]';
  return (
    
    <div className="h-full justify-center flex flex-col ">
      {square ? (
        <img
          className={w}
          src={image}
        />
      ) : null}
    </div>
  );
};

export default ChessSquare;

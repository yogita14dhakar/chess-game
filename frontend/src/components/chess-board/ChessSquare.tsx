import { Color, PieceSymbol, Square } from 'chess.js';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage , responsive, lazyload } from '@cloudinary/react';
import { fit } from '@cloudinary/url-gen/actions/resize';

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
  const image = cld
      .image(`/${square?.color === 'b' ? `${square.type}` : `${square.type.toUpperCase()}_copy`}`)
      .format('auto') 
      .quality('auto')
      .resize(fit().width(45).height(45));
 
  return (
    
    <div className="h-full justify-center flex flex-col ">
      {square ? (
        <AdvancedImage cldImg={image} plugins={[responsive(), lazyload()]}/>
      ) : null}
    </div>
  );
};

export default ChessSquare;

import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import { BACKEND_URL } from "../atoms/user";
import { useUser } from "../hooks/useUser";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";

const gameId = uuidv4();
function getUrl(){
    const user = useUser();
    return user;
}

export function Landing(){
    const navigate = useNavigate();
    const [isLandscape, setIsLandscape] = useState(screen.orientation.type === 'landscape-primary' || screen.orientation.type === 'landscape-secondary');

    useEffect(()=>{
        setIsLandscape(screen.orientation.type === 'landscape-primary' || screen.orientation.type === 'landscape-secondary');
    },[window.screen.orientation.type]);
    
    return (<div className="flex justify-center pt-20">
        <div className="max-w-screen-lg max-h-screen-lg">
        <h1 className="md:text-6xl text-4xl font-bold text-white text-center">Let's Play Chess Together</h1>
            <div className="flex justify-center gap-4">
                {isLandscape ? (<div className="flex justify-center mt-5 md:mt-20"><img src="chessImage.png" className="h-96 "></img></div>) :''}            
                <div className="flex flex-col justify-center mt-20 gap-4">
                        {getUrl() == null ? <Button onClick={ () => navigate(`/login`)} content="Login"></Button>:
                        <Button onClick={ () => window.open(`${BACKEND_URL}/auth/logout`, '_self')} content="logout"/>}
                        <Button onClick={ () => navigate("/game/random")} content="Play Online"></Button>
                        <Button onClick={ () => navigate(`/game/computer/${gameId}`)} content="Play With Computer"></Button>
                </div>
            </div>
        </div>
    </div>)
}
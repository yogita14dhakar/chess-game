import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import dotenv from 'dotenv';

dotenv.config();

export function Landing(){
    const navigate = useNavigate();
    return (<div className="flex justify-center pt-20">
        <div className="max-w-screen-lg max-h-screen-lg">
        <h1 className="md:text-6xl text-3xl font-bold text-white text-center">Let's Play Chess Together</h1>
            <div>            
                <div className="flex justify-center mt-20 gap-4">
                    <Button onClick={ () => navigate("/game/random")} content="Play Online"></Button>
                    <Button onClick={ () => navigate(document.cookie === '' ? "/login" : `${process.env.BACKEND_URL}/auth/logout`)} content={document.cookie === '' ? "Login" : "Logout"}></Button>
                </div>
                <div className="flex justify-center mt-5 md:mt-20">
                    <img src="chessImage.png" className="h-96 "></img>
                </div>
                
            </div>
        </div>
    </div>)
}
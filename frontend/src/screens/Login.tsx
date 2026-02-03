import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { BACKEND_URL, userAtom } from '../atoms/user';

const Login = () => {
  const navigate = useNavigate();
  const guestName = useRef<HTMLInputElement>(null);
  const [_, setUser] = useRecoilState(userAtom);
    const google = async() => {
      window.location.href = `${BACKEND_URL}/auth/google`;
    }

    const github = async() => {
      window.location.href = `${BACKEND_URL}/auth/github`;
    }

    const fetchUserProfile = async() => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'GET',
            credentials: 'include', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.warn('User is not authenticated');
            return null;
        }

        const user = await response.json();
        setUser(user);
        navigate('/');

      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
  
    const loginAsGuest = async() => {
      try{
        const response = await fetch(`${BACKEND_URL}/auth/guest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: (guestName.current && guestName.current.value) || 'Guest',
          }),
        });
        const user = await response.json();
        setUser(user);
        navigate('/');
      }catch(error){
        console.error('Error in login as guest', error);
      }
    }

  return (
    <div className="flex flex-col items-center justify-center max-w-screen-lg max-h-screen-lg text-textMain">
      <h1 className="md:text-6xl text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">
        Enter the Game World
      </h1>
      <div className="bg-bgAuxiliary2 rounded-lg shadow-lg p-8 flex flex-col md:flex-row">
        <div className="mb-8 md:mb-0 md:mr-8 justify-center flex flex-col">
          <div
            className="flex items-center justify-center px-4 py-2 rounded-md mb-4 cursor-pointer bg-white transition-colors hover:bg-gray-300 duration-300"
            onClick={()=> {
              google; 
              fetchUserProfile;
            }}
          >
            <img src="google.svg" alt="" className="w-6 h-6 mr-2" />
            Sign in with Google
          </div>
          <div
            className="flex items-center justify-center px-4 py-2 rounded-md cursor-pointer bg-white hover:bg-gray-300 transition-colors duration-300"
            onClick={()=> {
              github; 
              fetchUserProfile;
            }}
          >
            <img src="github.svg" alt="" className="w-6 h-6 mr-2" />
            Sign in with Github
          </div>
        </div>
        <div className="flex flex-col items-center md:ml-8">
          <div className="flex items-center mb-4">
            <div className="bg-white h-1 w-12 mr-2"></div>
            <span className="text-white">OR</span>
            <div className="bg-white h-1 w-12 ml-2"></div>
          </div>
          <input
            type="text"
            ref={guestName}
            placeholder="Username"
            className="border px-4 py-2 rounded-md mb-4 w-full md:w-64"
          />
          <button
            className="bg-[#e64833]/80 text-[#d1e8e2] px-4 py-2 rounded-md hover:bg-[#e64833] transition-colors duration-300"
            onClick={() => loginAsGuest()}
          >
            Enter as guest
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-5 md:mt-20">
        <img src="/chessImage.png" className="h-96"></img>
      </div>
    </div>
  );
};

export default Login;

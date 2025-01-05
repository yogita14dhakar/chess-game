import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { Suspense } from 'react';
import { Loader } from './components/Loader';
import { Others } from './screens/Others';
import { RecoilRoot } from 'recoil';

function App() {
  return (
    <div>
      <RecoilRoot>
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <Routes>
            <Route path='https://lets-play-2fi3.onrender.com/' element={<Landing/>}></Route>
            <Route path='https://lets-play-2fi3.onrender.com/login' element={<Login/>}></Route>
            <Route path='https://lets-play-2fi3.onrender.com/game/:gameId' element={<Game/>}></Route>
            <Route path='https://lets-play-2fi3.onrender.com/*' element={<Others/>}></Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
      </RecoilRoot>
    </div>
  )
}

export default App

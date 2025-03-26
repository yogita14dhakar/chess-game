import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Landing } from './screens/Landing';
import { Game } from './screens/Game';
import Login from './screens/Login';
import { Suspense } from 'react';
import { Loader } from './components/Loader';
import { Others } from './screens/Others';
import { RecoilRoot } from 'recoil';
import { ComputerGame } from './screens/ComputerGame';

function App() {
  return (
    <div>
      <RecoilRoot>
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Landing/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/game/:gameId' element={<Game/>}></Route>
            <Route path='/game/computer/:gameId' element={<ComputerGame/>}></Route>
            <Route path='*' element={<Others/>}></Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
      </RecoilRoot>
    </div>
  )
}

export default App

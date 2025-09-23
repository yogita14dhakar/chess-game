<a href="url"><img src="frontend/public/chessImage.png" height="30%" width="30%" ></a>
# 🚀 Play Chess

*real‑time free chess web app supporting multiplayer matches you can also share the link with your friends
*can also play solo (play vs. machine)
*Supports login through google/github account or as a guest

---


## ✨ Features

* ♟️ Realtime multiplayer chess with rooms via Socket.IO

* 🤖 Play vs. Machine using Mini‑Max + Alpha‑Beta pruning (adjustable depth & heuristics)
 
* 🔐 OAuth login with Google and GitHub using Passport.js

* 🧠 Move legality & check/checkmate validation using a chess rules engine

* 💾 Persistent games (resume unfinished matches, store move history)

---

## 🛠 Tech Stack

* **Frontend:** React + Vite, Tailwind CSS
* **Libraries:** recoil, dotenv, cookie-parser, cors
* **Realtime:** Socket.IO
* **Backend:** Node.js, Express
* **Auth:** Passport.js (Google + GitHub strategies), jwt
* **Database:** MySQL
* **Cache / Sessions:** bullMQ / express-session, mysql-express-session
* **Rules/Engine:** chess.js (rules & FEN helpers) + custom Mini‑Max with alpha-beta prunning AI module

---

## ⚡ Getting Started
**Prerequisites:**
 node v20.13.1
 npm 10.5.2
 MySQL Workbench 8.0 CE
  
* Open a command shell/window:
   * git clone https://github.com/yogita14dhakar/chess-game.git <repo_name>
   
* cd <repo_name> to change directory to where you cloned the repo
  
* create database in mysql workbench in your local machine ![schema](Schema.sql)
  
* frontend: npm install and npm run dev in terminal (git bash)
  
* backend:
  * npm install to install dependencies
  * npx tsc (to compile)
  * node dist/src/index.js
    
* websockets:
  * npm install to install dependencies
  * npx tsc (to compile)
  * node dist/src/index.js
    
---

## 🎮 Usage

__Home_Page__
<a href="url"><img src="https://github.com/user-attachments/assets/9a7a7a92-7b21-4ad3-b046-56c073ba191b" height="50%" width="50%" ></a>

__Login_Page__ 
<a href="url"><img src="https://github.com/user-attachments/assets/97bc48dc-3970-4747-ae73-58ec002fa70e" height="50%" width="50%" ></a>

__Game_Page__
<a href="url"><img src="https://github.com/user-attachments/assets/b94bceb0-e0af-4ec0-bfa4-f5b6c17cff7c" height="50%" width="50%" ></a>

---

## 🗺 Future Improvements

* [ ] Add inChat option in live game
* [ ] user dashboard to view previous games history
* [ ] imporving moves in chess with machine 

---

## 💡 What I Learned

* Learned how to manage state using React hooks
* Gained experience with authentication using oauth and jwt
* Learned how to work with websockets
* worked with MySQL connection pool and queries and storing session data on server
* Learned about CORS policy and how to work with it
* Improved my understanding of REST APIs

---

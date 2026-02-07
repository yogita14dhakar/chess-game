# ♟️ Let's Play

## 📌 Project Description

**Let's Play** is a real-time, free chess web application that allows players to compete in multiplayer matches online.Users can create and share game links with friends for instant gameplay.The platform also supports solo play against an AI-powered chess engine.

The application provides flexible authentication options including Google login, GitHub login, or guest access, making it easy for users to start playing quickly.

The system leverages real-time communication using Socket.IO and integrates a custom AI engine built using Mini-Max with Alpha-Beta pruning for efficient decision making.

---

## ✨ Features

* ♟️ Real-time multiplayer chess matches
* 🔗 Shareable game links for inviting friends
* 🤖 Play vs Machine (AI opponent)
* 🔐 Authentication via:

  * Google OAuth
  * GitHub OAuth
  * Guest Login
* ⚡ Real-time game synchronization using Socket.IO
* 🧠 Chess engine powered by:

  * chess.js (rules, FEN handling)
  * Custom Mini-Max + Alpha-Beta Pruning AI
* 🗄️ MySQL database for persistent storage
* 📦 Session & queue management using BullMQ and Express Session

---

## 🛠️ Tech Stack

### **Frontend**

* React + Vite
* Tailwind CSS

### **Libraries**

* Recoil (State Management)
* dotenv
* cookie-parser
* cors

### **Backend**

* Node.js  (v20.13.1)
* Express.js

### **Realtime Communication**

* Web Sockets

### **Authentication**

* Passport.js

  * Google Strategy
  * GitHub Strategy
* JWT (JSON Web Tokens)

### **Database**

* MySQL

### **Cache / Session**

* BullMQ
* express-session
* mysql-express-session

### **Chess Rules & AI**

* chess.js
* Custom Mini-Max AI with Alpha-Beta Pruning

---

## 🚀 Installation Steps

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yogita14dhakar/chess-game.git
cd chess-game
```

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

#### WS

```bash
cd ws
npm install
```

---

### 3️⃣ Environment Setup

Create `.env` files in both **client** and **server** directories.

#### Example Backend `.env`

```env
ALLOWED_HOSTS=your_frontend_url
AUTH_REDIRECT_URL=your_redirect_url

DATABASE_URL
DB_SSL_CA

JWT_SECRET=your_secret
COOKIE_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

#### Example ws `.env`

```env
BACKEND_URL=your_backend_url

DATABASE_URL
DB_SSL_CA

JWT_SECRET=your_secret

REDIS_DATABASE_NAME=
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=
REDIS_USERNAME=
```

---

### 4️⃣ Start Development Servers

#### Start Backend

```bash
cd backend
npm run dev
```

#### Start Frontend

```bash
cd frontend
npm run dev
```
#### Start WS

```bash
cd ws
npm run dev
```
---

## ▶️ Usage Instructions

1. Open the frontend URL (usually `http://localhost:5173`)
2. Login using:

   * Google
   * GitHub
   * Guest Mode
3. Choose game mode:

   * Multiplayer (Create / Join via link)
   * Play vs AI
4. Start playing chess in real-time

---

## 📂 Project Structure

```
chess-game/
│
├── backend/                         # REST API Server (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── modules/                 
│   │   │   ├── src/
│   │   │   |    ├── db/              # Database access layer
│   │   │   |    │   └── index.ts
│   │   │   |    └── Message.ts      
│   │   │   └── const.ts        
│   │   ├── router/          # API routers
│   │   │   └── auth.ts              
│   │   ├── const.ts          
│   │   ├── index.ts             
│   │   └── passport.ts
│
├── frontend/                        # React + Vite + Tailwind Client
│   ├── public/                      # Static assets (pieces, icons, audio)
│   │   ├── chess pieces images
│   │   ├── oauth icons (google, github)
│   │   └── audio assets
│   │
│   ├── src/
│   │   ├── atoms/                  
│   │   │   ├── chessBoard.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── components/
│   │   │   ├── chess-board/         # Board rendering components
│   │   │   │   ├── ChessSquare.tsx
│   │   │   │   ├── LegalMoveIndicator.tsx
│   │   │   │   ├── LetterNotation.tsx
│   │   │   │   └── NumberNotation.tsx
│   │   │   │
│   │   │   ├── ui/                  # UI reusable components
│   │   │   │   ├── WaitOpponent.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   └── button.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── DrawModal.tsx
│   │   │   ├── ExitGameModal.tsx
│   │   │   ├── GameEndModal.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── MovesTable.tsx
│   │   │   ├── ShareGame.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   └── chessBoard.tsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── computerMove.ts
│   │   │   ├── usePersistence.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useUser.ts
│   │   │
│   │   ├── lib/                     
│   │   │   ├── Message.ts
│   │   │   ├── const.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── screens/                 # App screens / routes
│   │   │   ├── ComputerGame.tsx
│   │   │   ├── Game.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Others.tsx
│   │   │
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│
├── ws/                              # WebSocket Server (Socket.IO + Game Engine)
│   ├── src/
│   │   ├── auth/                    
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/
│   │   │   └── src/
│   │   │   |    ├── db/              
│   │   │   |    │   └── index.ts
│   │   │   |    ├── Message.ts       
│   │   │   ├── const.ts          
│   │   │   └── queue.ts
│   │   │
│   │   ├── Game.ts
│   │   ├── GameManager.ts
│   │   ├── SocketManager.ts
│   │   └── index.ts                
│
├── .gitignore
├── README.md
└── Schema.sql 
```
🧠 Architecture Explanation

project follows a 3-layer service architecture:

🎨 Frontend

*UI rendering

*Socket client

*Game interaction

*Local state via Recoil

🧩 Backend (REST API)

*Authentication (Passport + JWT)

*User management

*Game metadata storage

*Session handling

⚡ WS Server (Realtime Engine)

*Multiplayer realtime communication

*Active game state management

*Move validation sync

*Queue + matchmaking handling

---

## 📸 Screenshots

### Home Page

<a href="url"><img src="https://github.com/user-attachments/assets/9a7a7a92-7b21-4ad3-b046-56c073ba191b" height="50%" width="50%" ></a>

### Multiplayer Game Board

<a href="url"><img src="https://github.com/user-attachments/assets/b94bceb0-e0af-4ec0-bfa4-f5b6c17cff7c" height="50%" width="50%" ></a>

### Login Page

<a href="url"><img src="https://github.com/user-attachments/assets/97bc48dc-3970-4747-ae73-58ec002fa70e" height="50%" width="50%" ></a>

---

## 🔌 API Endpoints

### Auth Routes

```
GET    /auth/google
GET    /auth/github
GET    /auth/logout
GET    /auth/login/failed
GET    /auth/refresh
POST   /auth/guest
```

---

### Game Routes

```
GET    /game/:gameId
POST   /game/computer/:gameId
```

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

## 👩‍💻 Author / Contact

**Project Name:** Let's Play
**Developer:** Yogita Dhakar

📧 Email: [yogitadhakar5@gmail.com](mailto:yogitadhakar5@gmail.com)
🐙 GitHub: [https://github.com/yogita14dhakar](https://github.com/yogita14dhakar)

---

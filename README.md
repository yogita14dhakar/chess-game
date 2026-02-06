---

# ♟️ Let's Play

## 📌 Project Description

**Let's Play** is a real-time, free chess web application that allows players to compete in multiplayer matches online. Users can create and share game links with friends for instant gameplay. The platform also supports solo play against an AI-powered chess engine.

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

* Node.js
* Express.js

### **Realtime Communication**

* Socket.IO

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
git clone https://github.com/your-username/lets-play.git
cd lets-play
```

### 2️⃣ Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

---

### 3️⃣ Environment Setup

Create `.env` files in both **client** and **server** directories.

#### Example Backend `.env`

```env
PORT=5000

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=letsplay_db

JWT_SECRET=your_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

---

### 4️⃣ Start Development Servers

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
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
lets-play/
│
├── backend/                 
│   ├── module/
│   │   ├── components/       
│   │   ├── pages/            
│   │   ├── recoil/           
│   │   ├── socket/           
│   │   ├── hooks/           
│   │   ├── utils/           
│   │   └── assets/         
│   ├── public/
│   └── vite.config.js
│
├── frontend/                 
│   ├── config/               
│   ├── controllers/       
│   ├── routes/            
│   ├── middleware/    
│   ├── models/              
│   ├── services/           
│   ├── sessions/      
│   └── server.js          
│
├── ws/                    
│   ├── events/        
│   ├── rooms/              
│   ├── game/               
│   ├── middleware/          
│   ├── adapters/             
│   └── socketServer.js    
│
├── .env
├── package.json
└── README.md

```

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
POST   /api/game/create
POST   /api/game/join
GET    /game/:gameId
POST   /game/computer/:gameId
```

---

### User Routes

```
GET    /api/user/profile
POST   /api/user/guest
```

---

## 🤝 Contributing Guidelines

Contributions are welcome!

### Steps:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature-name
```

3. Commit changes

```bash
git commit -m "Add your message"
```

4. Push branch

```bash
git push origin feature/your-feature-name
```

5. Open Pull Request

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

## 📜 License

This project is licensed under the **MIT License**.

---

## 👩‍💻 Author / Contact

**Project Name:** Let's Play
**Developer:** Yogita Dhakar

📧 Email: [your-email@example.com](mailto:your-email@example.com)
🐙 GitHub: [https://github.com/your-username](https://github.com/your-username)

---

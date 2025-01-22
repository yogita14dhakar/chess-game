import { Request, Response, Router } from "express";
import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { COOKIE_MAX_AGE } from "../const";
import { insertUser , find, connect_db, connection} from '../modules/src/db';
import dotenv from 'dotenv';


dotenv.config();
const router = Router();


const CLIENT_URL = process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173/game/random';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface userJwtClaims {
    userId: string;
    name: string;
    isGuest?: boolean;
}

interface UserDetails {
    id: string;
    token?: string;
    name: string;
    isGuest?: boolean;
}

// this route is to be hit when the user wants to login as a guest
router.post('/guest', async (req: Request, res: Response) => {
    const bodyData = req.body;
    let guestUUID = uuidv4();
    const q = "INSERT INTO User (id, username, name, email, provider) VALUES ?" 
    const VALUES = [[guestUUID, `guest-${guestUUID}`, bodyData.name||guestUUID , guestUUID+"@playchess.com", 'GUEST']];   
    connect_db;
    await insertUser(q, VALUES);
    const user = await find(`SELECT * FROM User WHERE id = '${guestUUID}'`);
    connection.end();
    const token = jwt.sign(
      { userId: user.id, name: user.name, isGuest: true },
      JWT_SECRET,
    );
    const UserDetails: UserDetails = {
      id: user.id,
      name: user.name,
      token: token,
      isGuest: true,
    };
    res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
    res.json(UserDetails);
});
  
router.get('/refresh', async (req: Request, res: Response) => {
  console.log(req.cookies);
  console.log(req.session);
  if (req.user) {
    const user = req.user as UserDetails; 
    const q = `SELECT * FROM User WHERE id = '${user.id}'`;
    connect_db;
    let userDb = await find(q);
    connection.end();
    const token = jwt.sign({ userId: userDb.id, name: userDb.name}, JWT_SECRET);
    res.json({
      token,
      id: userDb.id,
      name: userDb.name,
    }); 
  }
  else if (req.cookies && req.cookies.guest) {
    const decoded = jwt.verify(req.cookies.guest, JWT_SECRET) as userJwtClaims;
    const token = jwt.sign(
      { userId: decoded.userId, name: decoded.name, isGuest: true },
      JWT_SECRET
    );
    let User: UserDetails = {
      id: decoded.userId,
      name: decoded.name,
      token: token,
      isGuest: true,
    };
    res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
    res.json(User);
  } 
  else {
    res.status(401).json({ success: false, message: 'Unauthorized'});
  }
});

//failed to login user route
router.get('/login/failed', (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: 'failure' });
});

//logout user 
router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('guest');
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).json({ error: 'Failed to log out' });
    } else {
      res.clearCookie('jwt');
      res.redirect('http://localhost:5173/');
    }
  });
});

//google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/auth/login/failed',
  }),
);

//github
router.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email'], prompt: 'select_account' }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/auth/login/failed',
  }),
);


export default router;
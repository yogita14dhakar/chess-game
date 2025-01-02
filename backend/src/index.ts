console.log(__dirname);
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { initPassport } from './passport';
import dotenv from 'dotenv';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import authRoute from './router/auth';
import { COOKIE_MAX_AGE } from './const';

const app = express();


dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(
    session({
      secret: process.env.COOKIE_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: COOKIE_MAX_AGE },
    }),
  );

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));

const allowedHosts = process.env.ALLOWED_HOSTS ? process.env.ALLOWED_HOSTS.split(',') : [];

app.use(
    cors({
      origin: allowedHosts,
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }),
);

app.use('/auth', authRoute);

const PORT = 3000;
app.listen(PORT, () => {
    console.log("app is listning")
})
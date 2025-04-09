import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { initPassport } from './passport';
import dotenv from 'dotenv';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import authRoute from './router/auth';
import { COOKIE_MAX_AGE } from './const';
const MySQLStore = require('express-mysql-session')(session);

import { connPool } from './modules/src/db/index';
const sessionStore = new MySQLStore({
  schema: {
    tableName: 'user_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, connPool);


const app = express();


dotenv.config();
app.use(express.json());
app.use(cookieParser());

  app.use(session({
    cookie:{
      secure: true,
      maxAge:COOKIE_MAX_AGE,
    },
    store: sessionStore,
    secret: process.env.COOKIE_SECRET || 'keyboard cat',
    saveUninitialized: true,
    resave: false
    }));

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
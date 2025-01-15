const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
import passport from 'passport';
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';
import { connect_db, connection, find, insertUser } from './modules/src/db';

dotenv.config();
interface GithubEmailRes {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: 'private' | 'public';
}


const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || 'your_github_client_id';
const GITHUB_CLIENT_SECRET =
  process.env.GITHUB_CLIENT_SECRET || 'your_github_client_secret';

export function initPassport(){
    if (
        !GOOGLE_CLIENT_ID ||
        !GOOGLE_CLIENT_SECRET ||
        !GITHUB_CLIENT_ID ||
        !GITHUB_CLIENT_SECRET
      ) {
        throw new Error(
          'Missing environment variables for authentication providers',
        );
      }
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
            },
            async function (
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (error: any, user?: any) => void,
            ){
                const q1 = `INSERT INTO User (id, email, name, provider, lastLogin) 
                VALUES ? ON DUPLICATE KEY UPDATE name = '${profile.displayName}', provider = 'GOOGLE', lastLogin = CURRENT_TIMESTAMP()`;
                const VALUES = [[uuidv4(), `${profile.emails[0].value}`, `${profile.displayName}`, 'GOOGLE', new Date().toISOString().slice(0, 19).replace('T', ' ')]];
                connect_db;
                await insertUser(q1, VALUES); // if user exist it will update the nameor else it will insert in table
                const user = await find(`SELECT * FROM User WHERE email = '${profile.emails[0].value}'`);
                connection.end();
                done(null, user);
            }

        )
    )

    passport.use(
        new GithubStrategy(
            {
                clientID: GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET,
                callbackURL: '/auth/github/callback',
            },
            async function (
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (error: any, user?: any) => void,
            ){

                const res = await fetch('https://api.github.com/user/emails', {
                    headers: {
                      Authorization: `token ${accessToken}`,
                    },
                });

                const data: GithubEmailRes[] = await res.json();
                const primaryEmail = data.find((item) => item.primary === true);

                const q1 = `INSERT INTO User (id, email, name, provider, lastLogin) 
                VALUES ? ON DUPLICATE KEY UPDATE name = '${profile.displayName}', provider = 'GITHUB', lastLogin = CURRENT_TIMESTAMP()`;
                const VALUES = [[uuidv4(), `${primaryEmail!.email}`, `${profile.displayName}`, 'GITHUB', new Date().toISOString().slice(0, 19).replace('T', ' ')]];
                connect_db;
                await insertUser(q1, VALUES); // if user exist it will update the nameor else it will insert in table
                const user = await find(`SELECT * FROM User WHERE email = '${primaryEmail!.email}'`);
                connection.end();
                done(null, user);
            }
        )
    )

    passport.serializeUser(function (user: any, cb) {
        process.nextTick(function () {
          return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture,
          });
        });
      });
    
    passport.deserializeUser(function (user: any, cb) {
        process.nextTick(function () {
          return cb(null, user);
        });
    });
    
}
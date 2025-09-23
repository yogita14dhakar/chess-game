import mysql, { FieldPacket } from 'mysql2';
import dotenv from 'dotenv';

import { createPool } from 'mysql2/promise';

dotenv.config();

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create the connection pool. The pool-specific settings are the defaults
export const connPool = createPool({
  host                  : process.env.HOST,
  user                  : process.env.USER,
  password              : process.env.PASSWORD,
  database              : process.env.DATABASE,
  waitForConnections    : true,
  connectionLimit       : 3,
  maxIdle               : 3, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout           : 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit            : 0,
  enableKeepAlive       : true,
  keepAliveInitialDelay : 0,
});

export const insertUser = async (q:string, VALUES: any[][])=>{
    let connection;
    try{
        connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.query(q, [VALUES]);
            if(err) throw err;
            return;
    }catch(err){
        console.log(err);
    }finally {
        await sleep(2000);
    
        // Don't forget to release the connection when finished!
        if (connection) connection.release();
    }
}

export const update = async (q: string) => {
    let connection;
    try{
        connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.query(q);
            if(err) throw err;
            return JSON.parse(JSON.stringify(rows[0]));
    }catch(err){
        console.log(err);
    }finally {
        await sleep(2000);
    
        // Don't forget to release the connection when finished!
        if (connection) connection.release();
    }
}

export const findMany = async (q: string) => {
    let connection;
    try{
        connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.query(q);
            if(err) throw err;
            return JSON.parse(JSON.stringify(rows));
    }catch(err){
        console.log(err);
    }finally {
        await sleep(2000);
    
        // Don't forget to release the connection when finished!
        if (connection) connection.release();
    }
}

export const transcationUpdate = async (q:string)=>{
    let connection;
    try{
        connection = await connPool.getConnection();
        const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.query(q);
    }catch(err){
        console.log(err);
    }finally {
        await sleep(2000);
    
        // Don't forget to release the connection when finished!
        if (connection) connection.release();
    }
}


export const transaction = async (q1: string , q2: string, VALUES: any[])=>{
    const connection = await connPool.getConnection();
    try{
        await connection.beginTransaction();
        await insertUser(q1, VALUES);
        await transcationUpdate(q2);
        await connection.commit();
    }catch(error){
        if (connection) await connection.rollback();
        throw error;
    }finally {
        if (connection) await connection.release();
    }
    
}

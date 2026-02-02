import { FieldPacket } from 'mysql2';
import dotenv from 'dotenv';

import mysql from 'mysql2/promise';

dotenv.config();

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create the connection pool. The pool-specific settings are the defaults
export const connPool = mysql.createPool({
    uri                 :  `${process.env.DATABASE_URL}`,
    ssl                 :  {
                            // Read the certificate file
                            ca: process.env.DB_SSL_CA,
                            rejectUnauthorized: true,
                           },
    waitForConnections  :  true,
    connectionLimit     :  10,
});

export const insertUser = async (q:string, VALUES: any[][])=>{
    // let connection;
    try{
        // connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connPool.query(q, [VALUES]);
            if(err) throw err;
            return;
    }catch(err){
        console.log(err);
     }
     // finally {
    //     await sleep(2000);
    
    //     // Don't forget to release the connection when finished!
    //     if (connection) connection.release();
    // }
}

export const update = async (q: string) => {
    // let connection;
    try{
        // connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connPool.query(q);
            if(err) throw err;
            return JSON.parse(JSON.stringify(rows[0]));
    }catch(err){
        console.log(err);
    }
    // finally {
    //     await sleep(2000);
    
    //     // Don't forget to release the connection when finished!
    //     if (connection) connection.release();
    // }
}

export const findMany = async (q: string) => {
    // let connection;
    try{
        // connection = await connPool.getConnection();
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connPool.query(q);
            return JSON.parse(JSON.stringify(rows));
    }catch(err){
        console.log(err);
    }
    // finally {
    //     await sleep(2000);
    
    //     // Don't forget to release the connection when finished!
    //     if (connection) connection.release();
    // }
}

export const transcationUpdate = async (q:string)=>{
    // let connection;
    try{
        // connection = await connPool.getConnection();
        const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connPool.query(q);
    }catch(err){
        console.log(err);
    }
    // finally {
    //     await sleep(2000);
    
    //     // Don't forget to release the connection when finished!
    //     if (connection) connection.release();
    // }
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

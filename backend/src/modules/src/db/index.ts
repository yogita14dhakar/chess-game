import { FieldPacket } from 'mysql2';
import fs from 'fs';
import dotenv from 'dotenv';

import mysql from 'mysql2/promise';

dotenv.config();

function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create the connection pool. The pool-specific settings are the defaults
export const connPool = mysql.createPool(
  `${process.env.DATABASE_URL}`,
  ssl: {
    // Read the certificate file from your project directory
    ca: fs.readFileSync('/backend/ca.pem'),
  }
   );

export const insertUser = async (q:string, VALUES: any[][])=>{
    // let connection;
    try{
        // const connection = await connPool.getConnection();
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
        // const connection = await connPool.getConnection();
        const [rows]: [mysql.RowDataPacket[], FieldPacket[]] = await connPool.query(q);
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

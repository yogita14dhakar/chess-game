import mysql, { FieldPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const connection = mysql.createPool({
    //add as env variable
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD 
});
export const connect_db = () => { connection.getConnection((err, conn)=> {
    if(err) throw err;
    console.log("connected to the database");
});
}

export const insertUser = async (q:string, VALUES: any[][])=>{
    try{
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.promise().query(q, [VALUES]);
            if(err) throw err;
            return;
    }catch(err){
        console.log(err);
    }
}

export const update = async (q: string) => {
    try{
        const [rows, err]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.promise().query(q);
            if(err) throw err;
            return;
    }catch(err){
        console.log(err);
    }
}

export const find = async (q:string)=>{
    try{
        const [rows]: [mysql.RowDataPacket[], FieldPacket[]] = await connection.promise().query(q);
        return JSON.parse(JSON.stringify(rows[0]));
    }catch(err){
        console.log(err);
    }
}

export const findMany = async (q:string)=>{
    try{
        const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.promise().query(q);
        return JSON.parse(JSON.stringify(rows));
    }catch(err){
        console.log(err);
    }
}


export const transaction = async (q1: string , q2: string, VALUES: any[])=>{
    connection.getConnection((err, conn)=> {
        if (err) throw err;
        conn.beginTransaction(async(err)=>{
            if(err){
                conn.rollback((err)=>{
                    if (err) throw err;
                })
            }
            else{
                await insertUser(q1, VALUES);
                await update(q2);
                conn.commit((err)=>{
                    if (err){
                        conn.rollback((err)=>{
                            if (err) throw err;
                        })  
                    }
                });
            }
                
        });
    })
    
}

import { Queue } from 'bullmq';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv'; 
import { transaction } from './src/db';
dotenv.config();

const connection = new IORedis(Number(process.env.REDIS_PORT),process.env.REDIS_HOST||'redis_host',{maxRetriesPerRequest: null} );

export const addMoveToDb = async(VALUES: (string | number | Date)[][], q2: string) => {
    //querry to save move in database
    const q1 = "INSERT INTO Move (id, gameId, moveNumber, `from`, `to`, `before`, `after`, createdAt, timeTaken, san) VALUES ?";
    
    const myQueue = new Queue('moveQueue',{connection});
    //adding querry in queue
    await myQueue.add('querry_options', { q1, q2, VALUES });
}

const worker = new Worker(
  'moveQueue',
  async job => {
    //will add move to database
    await transaction(job.data.q1, job.data.q2, job.data.VALUES);
    console.log(job.data);
  },
  { connection },
);
worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`);
});
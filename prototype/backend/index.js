import express from 'express';
import cors from "cors"
import helmet from "helmet";


// dotenv
import dotenv from 'dotenv';
dotenv.config();


// database connection
import { connectDB } from './src/configs/dbConnect.js';
await connectDB();


// redis connection
import { redisConnect } from './src/configs/redis.js';
await redisConnect();


const app = express();


// use cors
import { corsOption } from './src/utils/frontendCors.js'
app.use(cors(corsOption));


import git_webHookRoutes from './src/routes/git_webHookRoutes.js'
app.use('/github-webhook', git_webHookRoutes)




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


import cookieParser from "cookie-parser";
app.use(cookieParser());

export default app;
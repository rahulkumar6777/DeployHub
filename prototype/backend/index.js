import express from 'express';
import cors from cors

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
app.use(cors(corsOption));


import git_webHookRoutes from './src/routes/git_webHookRoutes.js'
app.use('/github-webhook', git_webHookRoutes)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import cookieParser from "cookie-parser";
app.use(cookieParser());

export default app;
import express from 'express';
import cors from "cors"
import helmet from "helmet";



// database connection
import { connectDB } from './src/configs/dbConnect.js';
await connectDB();


// redis connection
import { redisConnect } from './src/configs/redis.js';
await redisConnect();


const app = express();


// use cors
import { Utils } from './src/Utils/index.js'
app.use(cors(Utils.Security.corsOption));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());


import cookieParser from "cookie-parser";
app.use(cookieParser());

export default app;
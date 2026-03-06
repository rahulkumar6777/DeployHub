import express from 'express';
import { controller } from '../controllers/index.js';
import { verifyJwt } from '../middlewares/Auth.js'

const router = express.Router();


// auth routes
router.post('/auth/register/init', controller.Auth.Local.Register.init);
router.post('/auth/register/verify', controller.Auth.Local.Register.verify);
router.post('/auth/login', verifyJwt, controller.Auth.Local.Login)
router.post('/auth/refresh/refreshtoken', verifyJwt, controller.Auth.RefreshToken)
router.get('/auth/github' , controller.Auth.Github.Login);
router.get('/auth/github/callback', controller.Auth.Github.callBack);
router.post('/auth/logut' , verifyJwt , controller.Auth.Logout);


// user
router.get('/user/me' , controller.User.me);





// userverification payment
import express from 'express';
import { controller } from '../controllers/index.js';
import { verifyJWT } from '../middlewares/Auth.js'

const router = express.Router();


// auth routes
router.post('/auth/register/init', controller.Auth.Local.Register.init);
router.post('/auth/register/verify', controller.Auth.Local.Register.verify);
router.post('/auth/login', verifyJWT, controller.Auth.Local.Login)
router.get('/auth/refresh/refreshtoken', verifyJWT, controller.Auth.RefreshToken)
router.get('/auth/github', controller.Auth.Github.Login);
router.get('/auth/github/callback', controller.Auth.Github.callBack);
router.post('/auth/logout', verifyJWT, controller.Auth.Logout);


// user
router.get('/user/me', controller.User.me);
// userverification payment
router.post('/me/verifyInit', verifyJWT, controller.Payment.userverify.init)
router.post('/me/verify', verifyJWT, controller.Payment.userverify.verify)










export default router
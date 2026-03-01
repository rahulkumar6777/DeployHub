import express from 'express';
import { contollers } from '../controllers/index.js';
import { verifyJWT } from '../middlewares/Auth.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();


// auth routes
router.post('/register/init', contollers.Auth.Register.init);
router.post('/register/verify', contollers.Auth.Register.verify);
router.post('/login', contollers.Auth.Login);
router.get('/refresh/refreshtoken', contollers.Auth.RefreshToken);
router.post('/logout', verifyJWT, contollers.Auth.Logout);
router.get('/auth/github', contollers.Auth.githubLogin);
router.get('/auth/github/callback', contollers.Auth.githubCallback);


// user
router.get('/me', verifyJWT, contollers.user.me);
router.post('/user/profile-pic' , upload.single('profilePic'), verifyJWT , contollers.user.profilePic)
router.put('/user/fullname' , verifyJWT , contollers.user.fullName)
router.post('/me/init', verifyJWT, contollers.user.initVerify);
router.post('/me/verify', verifyJWT, contollers.user.verify);
router.get('/invoice' , verifyJWT , contollers.user.Invoice);
router.get('/user/gitrepos' , verifyJWT , contollers.user.getUserRepos)
router.get('/projects' , verifyJWT , contollers.user.getUserProjects)


// deployment routes
router.route('/deployment').post(verifyJWT, contollers.Deployment.createDeployment);
router.route('/redeploy/:projectId').post(verifyJWT, contollers.Deployment.reDeployment);


// subscription routes
router.post('/subscription/init' , verifyJWT , contollers.subscription.init);
router.post('/subscription/verify' , verifyJWT , contollers.subscription.verfy);


export default router;
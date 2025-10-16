import express from 'express';

const authRouter = express.Router();
import authController from './auth-controller';

authRouter.post('/login', authController.login)
authRouter.post('/refresh', authController.refresh)



export default authRouter;

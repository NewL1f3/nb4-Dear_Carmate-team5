import express from 'express';
import * as userController from './users-controller';
import { asyncHandler } from '../../middlewares/async-handler';

const userRouter = express.Router();

userRouter.get('/me', asyncHandler(userController.getMe));

export { userRouter };

// 프론트랑 연결 테스트를 하기위해 만든 파일입니다. users 가 만들어 지면 지우는 파일입니다.
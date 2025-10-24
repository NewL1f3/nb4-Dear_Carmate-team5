import express from 'express';
import * as userController from './users-controller';
import { asyncHandler } from '../../middlewares/async-handler';
import { validatePatchMe } from './users-dto';

const userRouter = express.Router();

// 유저 수정
userRouter.patch('/me', validatePatchMe, asyncHandler(userController.patchMe));

// 테스트용 목데이터
userRouter.get('/me', asyncHandler(userController.getMe));

export { userRouter };

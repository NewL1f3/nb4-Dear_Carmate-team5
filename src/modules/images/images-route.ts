import express from 'express';
import * as imageController from './images-controller';
import { asyncHandler } from '../../middlewares/async-handler';
import { imageUpload } from '../../middlewares/cloudinary-upload-middleware';
import authenticateToken from '../../middlewares/auth-middleware';

const imageRouter = express.Router();

// 임시 로그인 목데이터
imageRouter.use(authenticateToken);

// 이미지 업로드
imageRouter.post('/upload', imageUpload, asyncHandler(imageController.uploadImage));

export { imageRouter };

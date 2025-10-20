import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import { startCleanupJob } from './lib/cron-jobs';
import { contractRouter } from './modules/contracts/contracts-router';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route';
import { userRouter } from './modules/users/users-router'; //임시
import carRouter from './modules/cars/cars-router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 프론트랑 연결 하기위해 임시로 적어놨습니다.
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        ],
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

// Cloudinary 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use('/api/users', userRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/contractDocuments', contractDocumentRouter);
app.use('/api/cars', carRouter);
app.use('/uploads', express.static('uploads'));

// Cron Job 활성화
startCleanupJob();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
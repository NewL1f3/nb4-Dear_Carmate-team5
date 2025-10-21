import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import companyRouter from './modules/company/company-router';
import { contractRouter } from './modules/contracts/contracts-router';
import { userRouter } from './modules/users/users-router'; // 임시
import cors from 'cors';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route';
import { v2 as cloudinary } from 'cloudinary';
import { startCleanupJob } from './lib/cron-jobs';
import customerRouter from './modules/customers/customers-router';
import carRouter from './modules/cars/cars-router';

dotenv.config();

const app = express();

// 프론트랑 연결 하기위해 임시로 적어놨습니다.
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Contract 라우터 등록
app.use('/users', userRouter);
app.use('/contracts', contractRouter);
// Cloudinary 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use('/companies', companyRouter);
app.use('/customers', customerRouter);
app.use('/api/users', userRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/contractDocuments', contractDocumentRouter);
app.use('/api/cars', carRouter);
app.use('/uploads', express.static('uploads'));
app.use('/contractDocuments', contractDocumentRouter);

// Cron Job 활성화
startCleanupJob();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
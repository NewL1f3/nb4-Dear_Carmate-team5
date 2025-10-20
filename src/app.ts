import express from 'express';
import dotenv from 'dotenv';
import { userRouter } from './modules/users/users-router'; // 임시
import companyRouter from './modules/company/company-router';
import cors from 'cors';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route';
import { contractRouter } from './modules/contracts/contracts-router';
import { v2 as cloudinary } from 'cloudinary';
import { startCleanupJob } from './lib/cron-jobs';
import customerRouter from './modules/customers/customers-router';

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

// Cloudinary 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use('/uploads', express.static('uploads'));
app.use('/users', userRouter);
app.use('/companies', companyRouter);
app.use('/contracts', contractRouter);
app.use('/contractDocuments', contractDocumentRouter);
app.use('/customers', customerRouter);

// Cron Job 활성화
startCleanupJob();

app.listen(process.env.PORT || 3001, () => console.log('서버 시작'));

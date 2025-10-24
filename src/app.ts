import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';
import authRouter from './modules/auth/auth-router';
import userRouter from './modules/user/user-router';
import companyRouter from './modules/company/company-router';
import carRouter from './modules/cars/cars-router';
import customerRouter from './modules/customers/customers-router';
import { contractRouter } from './modules/contracts/contracts-router';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route';
import dashboardRouter from './modules/dashboard/dashboard-router';
import { imageRouter } from './modules/images/images-route';
import { startCleanupJob } from './lib/cron-jobs';
import { errorHandler } from './middlewares/error-handler';

dotenv.config();

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: allowedOrigin,
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
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/companies', companyRouter);
app.use('/cars', carRouter);
app.use('/customers', customerRouter);
app.use('/contracts', contractRouter);
app.use('/contractDocuments', contractDocumentRouter);
app.use('/dashboard', dashboardRouter);
app.use('/images', imageRouter);

// Cron Job 활성화
startCleanupJob();

app.use(errorHandler);

app.listen(process.env.PORT || 3001, () => console.log('서버 시작'));

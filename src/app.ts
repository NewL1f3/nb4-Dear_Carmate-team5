import express from 'express';
import dotenv from 'dotenv';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
app.use(express.json());

// Cloudinary 환경 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use('/uploads', express.static('uploads'));
app.use('/contractDocuments', contractDocumentRouter);

app.listen(process.env.PORT || 3000, () => console.log('서버 시작'));

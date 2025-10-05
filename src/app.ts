import express from 'express';
import dotenv from 'dotenv';
import { contractDocumentRouter } from './modules/contract-documents/contract-documents-route.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use('/contractDocuments', contractDocumentRouter);

app.listen(process.env.PORT || 3000, () => console.log('서버 시작'));

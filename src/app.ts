import express from 'express';
import { contractRouter } from './routers/contract-router';

const app = express();
app.use(express.json());

// Contract 라우터 등록
app.use('/contracts', contractRouter);

app.listen(3000, () => console.log('서버 시작'));

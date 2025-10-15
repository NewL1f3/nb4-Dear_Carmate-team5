import express from 'express';
import dotenv from 'dotenv';
import { contractRouter } from './modules/contracts/contract-router';
import { userRouter } from './modules/users/users-router'; // 임시
import cors from 'cors';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());

// Contract 라우터 등록
app.use('/users', userRouter);
app.use('/contracts', contractRouter);

app.listen(process.env.PORT || 3001, () => console.log('서버 시작'));

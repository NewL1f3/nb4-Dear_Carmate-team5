// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import { ZodError } from 'zod';
import './car/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

import carRouter from './car/cars-router';
const apiRouter = express.Router();
apiRouter.use('/cars', carRouter);
app.use('/api', apiRouter);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: '입력값 검증 실패',
            errors: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    if (err.message.includes('찾을 수 없습니다')) {
        return res.status(404).json({ message: err.message });
    }

    // 인증 에러
    if (err.message.includes('인증') || err.message.includes('권한')) {
        return res.status(401).json({ message: err.message });
    }

    console.error('Server Error:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
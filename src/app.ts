// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { mockAuthMiddleware } from './middlewares/mock-auth-middleware';
import carRouter from './modules/cars/cars-router';
import { userRouter } from './modules/users/users-router';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: [
            'http://localhost:3001',
            'http://127.0.0.1:3001'
        ],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/cars', mockAuthMiddleware, carRouter);
app.use('/api/users', userRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('🚨 Error:', err.message);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

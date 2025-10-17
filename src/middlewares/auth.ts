import { Router, Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any; // or a specific type like: user?: { id: number; name: string }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user ) return res.status(401).json({ message: '로그인이 필요합니다' });
  next();
}
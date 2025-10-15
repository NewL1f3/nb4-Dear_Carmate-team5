import { Router, Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user ) return res.status(401).json({ message: '로그인이 필요합니다' });
  next();
}
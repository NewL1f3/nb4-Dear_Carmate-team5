import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 내 정보조회
// ✅ 인증 미들웨어
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 토큰에서 유저 정보 추출
    (req as any).user = decoded;
    next();
  });
};

export default authenticateToken;

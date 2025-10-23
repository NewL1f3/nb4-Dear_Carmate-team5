import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";


// 내 정보조회
// ✅ 인증 미들웨어
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
   throw new Error();
  }

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) {
      throw new Error();
    }

    // 토큰에서 유저 정보 추출
    (req as any).user = decoded;
    next();
  });
};

export default authenticateToken;
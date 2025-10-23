import express, { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { authService } from "./auth-service";
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();





class authController {
  login = async (req: Request, res: Response) => {
    //로그인
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호는 필수 입력 항목입니다.' });
      }
      const loginResult = await authService.login(email, password);

      return res.status(200).json(loginResult);
    } catch (error: any) {
      console.error("❌ 로그인 에러:", error.message);

      if (error.message.includes("올바르지")) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: "서버 오류", error: error.message });
    }
  };






 //토큰 갱신
  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      console.log('refresh 페이지 요청 들어왔음');
      console.log(req.body);

      //1. 요청 검증
      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken이 필요합니다" });
      }

      const tokens = await authService.refreshTokens(refreshToken);
      return res.status(200).json(tokens);
    } catch (error: any) {
      console.error("❌ refresh error:", error.message);

      if (error.message.includes("유효하지 않은")) {
        return res.status(403).json({ message: error.message });
      }

      return res.status(500).json({
        message: "서버 오류",
        error: error.message,
      });
    }
  };
}

  




export default new authController;

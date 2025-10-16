import express, { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();




interface LoginBody {
  email: string;
  password: string;
}



class authController {
  login = async (req: Request, res: Response) => {
    //로그인
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호는 필수 입력 항목입니다.' });
      }

      //1. 이메일 존재 확인
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: {
            select: {
              companyCode: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      // 2.비밀번호 비교
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." })
      }

      // 3. JWT 토큰 발급
      const accessToken = jwt.sign( //사용자 정보로 Access/Refresh Token 생성
        { userId: user.id, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || "refreshsecret",
        { expiresIn: "7d" }
      );

      // 4. 응답 데이터 구조화
      const responseUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeNumber: user.employeeNumber,
        phoneNumber: user.phoneNumber,
        imageUrl: user.imageUrl,
        isAdmin: user.isAdmin,
        company: {
          companyCode: user.company.companyCode,
        },
      };

      return res.status(200).json({
        user: responseUser,
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "서버 오류" });
    }

  }

  refresh = async (req: Request, res: Response) => {
    //토큰 갱신
    try {
      const { refreshToken } = req.body;

      //1. 요청 검증
      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken이 필요합니다" });
      }
      //2. refresh 검증
      let decoded: any;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || "refreshsecret"
        );
      } catch (err) {
        return res.status(403).json({ message: "유효하지 않은 refreshToken입니다." });
      }

      // 3. 토큰에서 사용자 정보 추출
      const userId = decoded.userId;
      if (!userId) {
        return res.status(403).json({ message: "잘못된 토큰 형식입니다." });
      }

      // 4. 사용자 확인
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // 5. 새 토큰 발급
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "1h" }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET || "refreshsecret",
        { expiresIn: "7d" }
      );

      // 6. 응답 반환
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      console.error(" refresh error:", err);
      return res.status(500).json({ message: "서버 오류" });
    }
  };


}




export default new authController;

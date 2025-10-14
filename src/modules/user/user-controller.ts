import express, { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import authenticateToken from '../../middleware/auth-middleware';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();



interface UserRegisterBody {
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  company: string;
  companyCode: string;
}


class userController {
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, employeeNumber, phoneNumber, password, passwordConfirmation, company, companyCode } = req.body;


      //1.비밀번호 확인
      if (password !== passwordConfirmation) {
        return res.status(400).json({ message: '비밀번호와 비밀번호 확인이 일치하지 않습니다' });
      }
      console.log('회원가입1');

      //2. 이메일 중복
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다' });
      }
      console.log('회원가입2');

      // 3. 회사 코드 검증
      if (!company || !companyCode) {
        return res.status(400).json({ message: "회사명과 회사 코드는 필수입니다." });
      }

      const companyRecord = await prisma.company.findFirst({
        where: {
          companyName: company,
          companyCode: companyCode,
        },
      });

      if (!companyRecord) {
        return res.status(400).json({ message: '기업 인증 실패' });
      }
      console.log('회원가입3');


      // 4. 비밀번호 해시
      const hashedPw = await bcrypt.hash(password, 10);

      console.log('회원가입4');

      //5. 유저생성
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          employeeNumber,
          phoneNumber,
          password: hashedPw,
          companyId: companyRecord.id,
          imageUrl: null,
          isAdmin: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          employeeNumber: true,
          phoneNumber: true,
          imageUrl: true,
          isAdmin: true,
          company: {
            select: {
              companyCode: true,
            },
          },
        },
      });
      console.log('회원가입5');

      return res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 오류' });
    }
  };









  // ✅ 내 정보 조회
  getMyInfo = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user; // 토큰에서 가져온 userId
      const userId = userInfo.userId;

      // DB에서 사용자 조회
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          employeeNumber: true,
          phoneNumber: true,
          imageUrl: true,
          isAdmin: true,
          company: {
            select: {
              companyCode: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error();
      }

      return res.status(200).json(user);
    } catch (err) {
      console.error("/users/me error:", err);
      throw new Error();
    }
  };




//정보 수정
patchMyInfo = async (req: Request, res: Response) => {
    try {
      // 토큰에서 유저 ID 추출
      const decoded = (req as any).user as JwtPayload;
      const userId = decoded.userId;

      const {
        employeeNumber,
        phoneNumber,
        currentPassword,
        password,
        passwordConfirmation,
        imageUrl,
      } = req.body;

      // ✅ 유저 존재 확인
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }

      // ✅ 현재 비밀번호 확인
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "현재 비밀번호가 올바르지 않습니다." });
      }

      // ✅ 새 비밀번호 확인 (선택적)
      let newHashedPassword = user.password;
      if (password || passwordConfirmation) {
        if (password !== passwordConfirmation) {
          return res.status(400).json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });
        }
        newHashedPassword = await bcrypt.hash(password, 10);
      }

      // ✅ 정보 업데이트
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          employeeNumber: employeeNumber ?? user.employeeNumber,
          phoneNumber: phoneNumber ?? user.phoneNumber,
          password: newHashedPassword,
          imageUrl: imageUrl ?? user.imageUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          employeeNumber: true,
          phoneNumber: true,
          imageUrl: true,
          isAdmin: true,
          company: {
            select: { companyCode: true },
          },
        },
      });

      return res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "서버 오류" });
    }
  };













//유저 탈퇴 
 deleteMyInfo = async(req: Request, res: Response) => {
    const userInfo = (req as any).user; // 토큰에서 가져온 userId
    const userId = userInfo.userId;

      // DB에서 사용자 조회
    const user = await prisma.user.findUnique({
        where: { id: userId }
      });
    if (!user) {
        throw new Error("잘못된 요청입니다");
      }

    try{
      await prisma.user.delete({
        where: {id: userId}
      })
      return 
    }catch(error){
      console.error(error)
      throw new Error("데이터베이스 오류 발생")
    }
      


 }

}







export default userController;






import express, { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import authenticateToken from '../../middleware/auth-middleware';
import { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();



interface UserRegisterBody {
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  companyName: string;
  companyCode: string;
}


class userController {
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, employeeNumber, phoneNumber, password, passwordConfirmation, companyName, companyCode } = req.body;


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
      if (!companyName || !companyCode) {
        return res.status(400).json({ message: "회사명과 회사 코드는 필수입니다." });
      }

      const companyRecord = await prisma.company.findFirst({
        where: {
          companyName: companyName,
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

      // 6️⃣ 회사 영업원 수(userCount) +1
      await prisma.company.update({
        where: { id: companyRecord.id },
        data: {
          userCount: { increment: 1 },
        },
      });

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
      const decoded = (req as any).user as JwtPayload;  //(req as any).user = decoded; // 토큰 검증 후 유저 정보 저장
      const userId = decoded.userId;  //그 안의 userId(로그인한 사용자 식별자)를 꺼낸다

      console.log("여기 1", req.body)
      const {
        employeeNumber,
        phoneNumber,
        currentPassword,
        password,
        passwordConfirmation,
        imageUrl,
      } = req.body;

      console.log("여기 2")

      // ✅ 유저 존재 확인
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("존재하지 않는 유저입니다.");
      }
      console.log("여기 3")
      // ✅ 현재 비밀번호 확인
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        throw new Error("현재 비밀번호가 올바르지 않습니다.");
      }
      console.log("여기 4")


      // ✅ 새 비밀번호 확인 (선택적)
      let newHashedPassword = user.password;
      if (password && passwordConfirmation) { //둘 다 입력되어야 실행
        if (password !== passwordConfirmation) {
          throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        newHashedPassword = await bcrypt.hash(password, 10);
      }


      console.log("여기 5")


      // ✅ 정보 업데이트
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          employeeNumber: employeeNumber ?? user.employeeNumber, //??는 앞에 있는 값이 없으면(=null 또는 undefined이면), 뒤의 값을 써라
          phoneNumber: phoneNumber ?? user.phoneNumber,  // 앞에 새 번호 뒤에는 원래 있던 번호
          password: newHashedPassword,
          imageUrl: imageUrl ?? user.imageUrl,
        },
        select: { //성공 값
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
      throw new Error("서버 오류");
    }
  };




  //회원 탈퇴 
  deleteMyInfo = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user; // 토큰에서 id 추출
      const userId = Number(userInfo.userId);
      console.log("탈퇴 1");

      // DB에서 해당 userId 유저 검색
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        console.log("탈퇴 2: 유저 없음 ❌");
        return res.status(404).json({ message: "존재하지 않는 유저입니다." });
      }

      console.log("탈퇴 2: 유저 확인 완료 → 삭제 시도");

      //실제로 유저 삭제
      await prisma.user.delete({ where: { id: userId } });

      console.log("탈퇴 3: 유저 삭제 성공 ✅");

      // 여기서 응답하고 끝
      return res.status(200).json({ message: "회원 탈퇴 완료" });

    } catch (error: any) {
      console.error("❌ 탈퇴 중 Prisma 에러:", error.message);
      return res.status(500).json({
        message: "회원 탈퇴 중 오류가 발생했습니다.",
        error: error.message, // 진짜 Prisma 오류 메시지를 반환
      });
    }
  };


  // ① 인증 정보 확인 (JWT 등
  // ② 유저 존재 여부 확인
  // 3.권한 검증 (필요 시)
  // ④ 삭제 실행 (DB 연동)
  // ⑤ 응답 반환


  // ✅ 관리자 전용 유저 삭제
  deleteUser = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user;
      if (!userInfo) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const userId = Number(userInfo.userId);
      const targetUserId = Number(req.params.userId);

      console.log("삭제 1");

      if (isNaN(targetUserId)) {
        console.log("삭제 2");
        return res.status(400).json({ message: "잘못된 요청입니다." });
      }
      if (!userInfo.isAdmin) {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: { company: true },
      });
      console.log("삭제 3");

      if (!targetUser) {
        return res.status(404).json({ message: "존재하지 않는 유저입니다." });
      }
      console.log("삭제 4");


      // 🔹 6. 트랜잭션으로 유저 삭제 + 회사 인원수 감소 동시 처리
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: targetUserId } });

      if (targetUser.companyId) {
        await tx.company.update({
          where: { id: targetUser.companyId },
          data: { userCount: { decrement: 1 } },
        });
      }
    });

      console.log("삭제 6");
      return res.status(200).json({ message: "유저 삭제 성공" });

    } catch (error: any) {
      console.error("❌ 유저 삭제 에러:", error.message);
      return res.status(500).json({
        message: "회원 삭제 중 서버 오류가 발생했습니다.",
        error: error.message,
      });
    }
  };
}

export default new userController();



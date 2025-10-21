import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import authenticateToken from '../../middleware/auth-middleware';
import { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import { userService } from "./user-service";
import { UserRegisterBody } from "./user-types";
import { userRepository } from './user-repository';


export const prisma = new PrismaClient();




//회원가입
class userController {
  register = async (req: Request<{}, {}, UserRegisterBody>, res: Response) => {
    try {
      const newUser = await userService.register(req.body)
      return res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 오류' });
    }
  };









  //  ✅ 내 정보 조회
  getMyInfo = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user;
      const userId = Number(userInfo.userId);

      const user = await userService.getMyInfo(userId)

      return res.status(200).json(user);
    } catch (err) {
      console.error("/users/me error:", err);
      return res.status(404).json({ message: "유저 정보를 찾을 수 없습니다." });
    }
  };













  //정보 수정
  async patchMyInfo(req: Request, res: Response) {
  try {
    // 토큰에서 유저 ID 추출
    const decoded = (req as any).user;
    const userId = decoded.userId;

    const updatedUser = await userService.patchMyInfo(userId, req.body);

    res.status(200).json({
      message: "회원 정보가 성공적으로 수정되었습니다.",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "정보 수정 실패" });
  }
},
};










//     // ✅ 정보 업데이트
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         employeeNumber: employeeNumber ?? user.employeeNumber, //??는 앞에 있는 값이 없으면(=null 또는 undefined이면), 뒤의 값을 써라
//         phoneNumber: phoneNumber ?? user.phoneNumber,  // 앞에 새 번호 뒤에는 원래 있던 번호
//         password: newHashedPassword,
//         imageUrl: imageUrl ?? user.imageUrl,
//       },
//       select: { //성공 값
//         id: true,
//         name: true,
//         email: true,
//         employeeNumber: true,
//         phoneNumber: true,
//         imageUrl: true,
//         isAdmin: true,
//         company: {
//           select: { companyCode: true },
//         },
//       },
//     });

//     return res.status(200).json(updatedUser);
//   } catch (err) {
//     console.error(err);
//     throw new Error("서버 오류");
//   }
// };




// //회원 탈퇴 
// deleteMyInfo = async (req: Request, res: Response) => {
//   try {
//     const userInfo = (req as any).user; // 토큰에서 id 추출
//     const userId = Number(userInfo.userId);
//     console.log("탈퇴 1");

//     // DB에서 해당 userId 유저 검색
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//       console.log("탈퇴 2: 유저 없음 ❌");
//       return res.status(404).json({ message: "존재하지 않는 유저입니다." });
//     }

//     console.log("탈퇴 2: 유저 확인 완료 → 삭제 시도");

//     //실제로 유저 삭제
//     await prisma.user.delete({ where: { id: userId } });

//     console.log("탈퇴 3: 유저 삭제 성공 ✅");

//     // 여기서 응답하고 끝
//     return res.status(200).json({ message: "회원 탈퇴 완료" });

//   } catch (error: any) {
//     console.error("❌ 탈퇴 중 Prisma 에러:", error.message);
//     return res.status(500).json({
//       message: "회원 탈퇴 중 오류가 발생했습니다.",
//       error: error.message, // 진짜 Prisma 오류 메시지를 반환
//     });
//   }
// };


// // ① 인증 정보 확인 (JWT 등
// // ② 유저 존재 여부 확인
// // 3.권한 검증 (필요 시)
// // ④ 삭제 실행 (DB 연동)
// // ⑤ 응답 반환


// // ✅ 관리자 전용 유저 삭제
// deleteUser = async (req: Request, res: Response) => {
//   try {
//     const userInfo = (req as any).user;
//     if (!userInfo) {
//       return res.status(401).json({ message: "로그인이 필요합니다." });
//     }

//     const userId = Number(userInfo.userId);
//     const targetUserId = Number(req.params.userId);

//     console.log("삭제 1");

//     if (isNaN(targetUserId)) {
//       console.log("삭제 2");
//       return res.status(400).json({ message: "잘못된 요청입니다." });
//     }
//     if (!userInfo.isAdmin) {
//       return res.status(403).json({ message: "관리자 권한이 필요합니다." });
//     }

//     const targetUser = await prisma.user.findUnique({
//       where: { id: targetUserId },
//       include: { company: true },
//     });
//     console.log("삭제 3");

//     if (!targetUser) {
//       return res.status(404).json({ message: "존재하지 않는 유저입니다." });
//     }
//     console.log("삭제 4");


//     // 🔹 6. 트랜잭션으로 유저 삭제 + 회사 인원수 감소 동시 처리
//     await prisma.$transaction(async (tx) => {
//       await tx.user.delete({ where: { id: targetUserId } });

//       if (targetUser.companyId) {
//         await tx.company.update({
//           where: { id: targetUser.companyId },
//           data: { userCount: { decrement: 1 } },
//         });
//       }
//     });

//     console.log("삭제 6");
//     return res.status(200).json({ message: "유저 삭제 성공" });

//   } catch (error: any) {
//     console.error("❌ 유저 삭제 에러:", error.message);
//     return res.status(500).json({
//       message: "회원 삭제 중 서버 오류가 발생했습니다.",
//       error: error.message,
//     });
//   }
// };
// }

export default new userController();



import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import authenticateToken from '../../middlewares/auth-middleware';
import { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { userService } from './user-service';
import { UserRegisterBody } from './user-types';

export const prisma = new PrismaClient();

//회원가입
class userController {
  register = async (req: Request<{}, {}, UserRegisterBody>, res: Response) => {
    try {
      const newUser = await userService.register(req.body);
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
      const userId = Number(userInfo.id);

      const user = await userService.getMyInfo(userId);

      return res.status(200).json(user);
    } catch (err) {
      console.error('/users/me error:', err);
      return res.status(404).json({ message: '유저 정보를 찾을 수 없습니다.' });
    }
  };

  // ✅ 내 정보 수정
  patchMyInfo = async (req: Request, res: Response) => {
    try {
      const decoded = (req as any).user; // JWT에서 유저 정보 추출
      const userId = decoded.id;

      // body를 그대로 서비스에 전달
      const updatedUser = await userService.patchMyInfo(userId, req.body);

      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('❌ patchMyInfo error:', error.message);
      return res.status(500).json({ message: '서버 오류', error: error.message });
    }
  };

  ///////////////////////////////////////////////////////////////

  //회원 탈퇴
  deleteMyInfo = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user;
      const userId = Number(userInfo.id);

      const deleteResult = await userService.deleteMyInfo(userId);
      return res.status(200).json(deleteResult);
    } catch (error: any) {
      console.error('❌ 회원 탈퇴 중 오류:', error.message);

      if (error.message.includes('존재하지')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({
        message: '회원 탈퇴 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  };

  // ✅ 관리자 전용 유저 삭제
  deleteUser = async (req: Request, res: Response) => {
    try {
      const userInfo = (req as any).user;
      if (!userInfo) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      const userId = Number(userInfo.id);
      const targetUserId = Number(req.params.userId);

      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: '잘못된 요청입니다.' });
      }
      const deleteResult = await userService.deleteUser(targetUserId, userInfo.isAdmin);
      return res.status(200).json(deleteResult);
    } catch (error: any) {
      console.error('❌ 유저 삭제 에러:', error.message);

      if (error.message.includes('존재하지')) {
        return res.status(404).json({ message: error.message });
      }

      if (error.message.includes('관리자')) {
        return res.status(403).json({ message: error.message });
      }

      return res.status(500).json({
        message: '회원 삭제 중 서버 오류가 발생했습니다.',
        error: error.message,
      });
    }
  };
}

export default new userController();

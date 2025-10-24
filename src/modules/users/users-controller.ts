import * as contractDocumentService from './users-service';
import type { Request, Response } from 'express';
import type { PatchMeRequest } from './users-dto';

// 유저 수정
export const patchMe = async (req: PatchMeRequest, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const { user } = req;

  const data = req.parsedBody;

  const userData = await contractDocumentService.patchMe(user, data);
  return res.status(200).json(userData);
};

// 테스트용 목데이터
export const getMe = async (_req: Request, res: Response) => {
  const mockUser = {
    id: 1,
    nickname: '테스트유저',
    email: 'testuser@example.com',
  };

  return res.status(200).json(mockUser);
};

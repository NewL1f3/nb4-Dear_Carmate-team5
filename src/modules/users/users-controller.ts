import type { Request, Response } from 'express';

export const getMe = async (_req: Request, res: Response) => {
  const mockUser = {
    id: 1,
    nickname: '테스트유저',
    email: 'testuser@example.com',
  };

  return res.status(200).json(mockUser);
};

// 이 파일도 프론트 연결 확인을 위해 잠시 만든 파일입니다. users 만들어지면 지울 파일입니다.

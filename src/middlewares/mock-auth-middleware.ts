import { Request, Response, NextFunction } from 'express';

// 테스트 및 개발 목적으로 req.user 객체를 주입하는 임시 미들웨어
const MOCK_USER_ID = 1;

const MOCK_USER = {
  id: MOCK_USER_ID,
  isAdmin: true, // 관리자 권한 부여, false로 해도 상관 없음
  companyId: 1// 필요한 다른 사용자 정보 (예: companyId)
};

export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = MOCK_USER;
  console.log(`[Mock Auth] 사용자 ID ${MOCK_USER_ID} 주입 완료.`);
  next();
};

// user가 개발이 되기 전에 기능 테스트를 하기 위래 만든 임시 미들웨어입니다.
// user가 만들어 지면 지워야 합니다.

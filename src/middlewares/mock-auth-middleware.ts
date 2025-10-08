import { Request, Response, NextFunction } from 'express';
// 여러분의 User 타입을 임포트하세요. 예: { id: number; isAdmin: boolean; }

// 이 값은 seed.ts에서 생성한 '테스트 관리자'의 ID와 일치해야 합니다.
// (일반적으로 DB에서 1번 ID로 시작합니다.)
const MOCK_USER_ID = 1;

// 실제 앱에서는 JWT 토큰을 해석하여 이 객체를 만듭니다.
const MOCK_USER = {
  id: MOCK_USER_ID,
  isAdmin: true, // 관리자 권한 부여
  // 필요한 다른 사용자 정보 (예: companyId)
};

/**
 * 테스트 및 개발 목적으로 req.user 객체를 주입하는 임시 미들웨어
 */
export const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // TypeScript에게 req 객체에 user 속성이 있음을 알립니다 (Type Declaration이 필요할 수 있습니다).
  (req as any).user = MOCK_USER;
  console.log(`[Mock Auth] 사용자 ID ${MOCK_USER_ID} 주입 완료.`);
  next();
};

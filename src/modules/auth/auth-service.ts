import { email } from 'zod';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { authRepository } from './auth-repository';

export const authService = {
  login: async (email: string, password: string) => {
    //1. 이메일 존재 확인
    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2.비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }

    // 3. JWT 토큰 발급
    const accessToken = jwt.sign(
      //사용자 정보로 Access/Refresh Token 생성
      { id: user.id, companyId: user.companyId, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' },
    );

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', {
      expiresIn: '7d',
    });

    // 4. 응답 데이터 구조화
    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeNumber: user.employeeNumber,
      phoneNumber: user.phoneNumber,
      imageUrl: user.image?.fileUrl,
      isAdmin: user.isAdmin,
      company: {
        companyCode: user.company.companyCode,
      },
    };

    return {
      user: responseUser,
      accessToken,
      refreshToken,
    };
  },

  ////////////////////////////////////토큰 갱신
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    //2. refresh 검증
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshsecret');
    } catch (err) {
      throw new Error('유효하지 않은 refreshToken입니다.');
    }

    // 3. 토큰에서 사용자 정보 추출
    const userId = decoded.userId;
    if (!userId) {
      throw new Error('잘못된 토큰 형식입니다.');
    }

    // 4. 사용자 확인
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 5. 새 토큰 발급
    const newAccessToken = jwt.sign(
      { id: user.id, companyId: user.companyId, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' },
    );

    const newRefreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refreshsecret', {
      expiresIn: '7d',
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
};

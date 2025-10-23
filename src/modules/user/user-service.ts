import * as bcrypt from 'bcrypt';
import { UserRegisterBody } from './user-types';
import { userRepository } from './user-repository';
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

export const userService = {
  async register(data: UserRegisterBody) {
    const { name, email, employeeNumber, phoneNumber, password, passwordConfirmation, companyName, companyCode } = data;

    //1.비밀번호 확인
    if (password !== passwordConfirmation) {
      throw new Error('비밀번호와 비밀번호 확인이 일치하지 않습니다');
    }

    //2. 이메일 중복
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 3. 회사 코드 검증
    if (!companyName || !companyCode) {
      throw new Error('회사명과 회사 코드는 필수입니다.');
    }

    const companyRecord = await userRepository.findCompany(companyName, companyCode);
    if (!companyRecord) {
      throw new Error('기업 인증 실패');
    }

    // 4. 비밀번호 해시
    const hashedPw = await bcrypt.hash(password, 10);

    //5. 유저생성
    const newUser = await userRepository.createUser({
      name,
      email,
      employeeNumber,
      phoneNumber,
      password: hashedPw,
      companyId: companyRecord.id,
      imageUrl: null,
      isAdmin: false,
    });

    // 6️⃣ 회사 영업원 수(userCount) +1
    await userRepository.incrementCompanyUserCount(companyRecord.id);

    return newUser;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////
  //  ✅ 내 정보 조회

  getMyInfo: async (userId: number) => {
    // DB에서 사용자 조회
    const user = await userRepository.findUserProfileById(userId);

    if (!user) {
      throw new Error('존재하지 않는 유저입니다.');
    }

    return user;
  },

  //////////////////////////////////////////////////////////////////////////////////////////////

  //정보 수정
  patchMyInfo: async (userId: number, data: any) => {
    if (!data || Object.keys(data).length === 0) {
      console.log(data);
      throw new Error('요청 데이터가 없습니다.');
    }

    const { employeeNumber, phoneNumber, currentPassword, password, passwordConfirmation, imageUrl } = data;

    // ✅ 유저 존재 확인
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('존재하지 않는 유저입니다.');

    // ✅ 비밀번호 변경 로직
    let newHashedPassword = user.password;

    // 1️⃣ currentPassword가 존재하면 일단 유효성 검증
    if (currentPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) throw new Error('현재 비밀번호가 올바르지 않습니다.');
    }

    // 2️⃣ 새 비밀번호가 있다면 변경
    if (password && passwordConfirmation) {
      if (password !== passwordConfirmation) throw new Error('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      newHashedPassword = await bcrypt.hash(password, 10);
    }

    // ✅ 정보 업데이트
    const updatedUser = await userRepository.updateUser(userId, {
      employeeNumber: employeeNumber ?? user.employeeNumber,
      phoneNumber: phoneNumber ?? user.phoneNumber,
      password: newHashedPassword,
      imageUrl: imageUrl ?? user.imageUrl,
    });

    return updatedUser;
  },

  //////////////////////

  //회원 탈퇴
  deleteMyInfo: async (userId: number) => {
    // DB에서 해당 userId 유저 검색
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('존재하지 않는 유저입니다.');
    }

    //실제로 유저 삭제
    await userRepository.deleteUserById(userId);

    return { message: '회원 탈퇴 완료' };
  },

  /////////////////////////////////////////

  // ✅ 관리자 전용 유저 삭제
  deleteUser: async (targetUserId: number, isAdmin: boolean) => {
    // 1️⃣ 관리자 권한 확인
    if (!isAdmin) {
      throw new Error('관리자 권한이 필요합니다.');
    }

    // 2️⃣ 대상 유저 조회
    const targetUser = await userRepository.findUserWithCompanyById(targetUserId);
    if (!targetUser) {
      throw new Error('존재하지 않는 유저입니다.');
    }

    // 3️⃣ 트랜잭션 실행 (유저 삭제 + 회사 인원수 감소)
    await prisma.$transaction(async (tx) => {
      await userRepository.deleteId(targetUserId, tx);

      if (targetUser.companyId) {
        await userRepository.decrementCompanyUserCount(targetUser.companyId, tx);
      }
    });

    return { message: '유저 삭제 성공' };
  },
};

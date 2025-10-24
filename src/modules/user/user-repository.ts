import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
export const prisma = new PrismaClient();

export const userRepository = {
  //2. 이메일 중복
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  findCompany: async (companyName: string, companyCode: string) => {
    return await prisma.company.findFirst({
      where: { companyName, companyCode },
    });
  },

  //5. 유저생성
  createUser: async (data: any) => {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        employeeNumber: true,
        phoneNumber: true,
        imageId: true,
        isAdmin: true,
        company: {
          select: {
            companyCode: true,
          },
        },
      },
    });
  },

  // 6️⃣ 회사 영업원 수(userCount) +1
  incrementCompanyUserCount: async (companyId: number) => {
    return prisma.company.update({
      where: { id: companyId },
      data: { userCount: { increment: 1 } },
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////
  //  ✅ 내 정보 조회
  findUserProfileById: async (userId: number) => {
    // DB에서 사용자 조회
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        employeeNumber: true,
        phoneNumber: true,
        isAdmin: true,
        company: {
          select: {
            companyCode: true,
          },
        },
        image: {
          select: {
            fileUrl: true,
          },
        },
      },
    });
  },

  //////////////////////////////////////////////////////////////////////////////////////////////

  //정보 수정
  findUserById: async (id: number) => {
    return await prisma.user.findUnique({ where: { id } });
  },

  updateUser: async (id: number, data: any) => {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        employeeNumber: true,
        phoneNumber: true,
        isAdmin: true,
        company: { select: { companyCode: true } },
        image: {
          select: {
            fileUrl: true,
          },
        },
      },
    });
  },

  ///////////////////////////////////////////
  //회원 탈퇴
  getUserById: async (userId: number) => {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  },
  deleteUserById: async (userId: number) => {
    return prisma.user.delete({
      where: { id: userId },
    });
  },

  /////////////////////////////////////////////////

  // ✅ 관리자 전용 유저 삭제
  // 유저 단일 조회 (회사 정보 포함)
  findUserWithCompanyById: async (userId: number) => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });
  },

  // ✅ 트랜잭션 클라이언트 타입 지정
  deleteId: async (userId: number, tx: Prisma.TransactionClient = prisma) => {
    return tx.user.delete({
      where: { id: userId },
    });
  },

  // ✅ 트랜잭션 클라이언트 타입 지정
  decrementCompanyUserCount: async (companyId: number, tx: Prisma.TransactionClient = prisma) => {
    return tx.company.update({
      where: { id: companyId },
      data: { userCount: { decrement: 1 } },
    });
  },
};

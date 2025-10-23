import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();


//로그인
export const authRepository = {
    findByEmail: async (email: string) => {

        //1. 이메일 존재 확인
        return await prisma.user.findUnique({
            where: { email },
            include: {
                company: {
                    select: {
                        companyCode: true,
                    },
                },
            },
        });
    },





//////////////////////////////////////

        findById: async (userId: number) => {

        // 4. 사용자 확인
        return await prisma.user.findUnique({
            where: { id: userId },
        });
    },
};



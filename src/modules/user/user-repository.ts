import { PrismaClient } from '@prisma/client';
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
                imageUrl: true,
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
    }
}
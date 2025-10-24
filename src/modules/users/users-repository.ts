import prisma from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

// 유저 수정
export const patchMe = async (id: number, updateData: Prisma.UserUpdateInput) => {
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      employeeNumber: true,
      phoneNumber: true,
      isAdmin: true,
      company: {
        select: {
          companyName: true,
        },
      },
      image: {
        select: {
          fileUrl: true,
        },
      },
    },
  });

  return user;
};

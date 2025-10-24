import * as userRepository from './users-repository';
import type { PatchMeData } from './users-dto';
import type { Prisma } from '@prisma/client';

// 유저 수정
export const patchMe = async (user: Prisma.UserGetPayload<{}>, data: PatchMeData) => {
  const { currentPassword, employeeNumber, imageId, phoneNumber } = data;

  const { id } = user;

  //기존 데이터와 새 데이터 비교
  const updateData: Prisma.UserUpdateInput = {
    ...(currentPassword !== user.password && { currentPassword }),
    ...(employeeNumber !== user.employeeNumber && { employeeNumber }),
    ...(phoneNumber !== user.phoneNumber && { phoneNumber }),
    image: {
      connect: { id: imageId },
    },
  };

  const userData = await userRepository.patchMe(id, updateData);

  // 데이터 가공
  const finalUserData = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    employeeNumber: userData.employeeNumber,
    phoneNumber: userData.phoneNumber,
    image: userData.image?.fileUrl,
    isAdmin: userData.isAdmin,
    company: {
      companyName: userData.company.companyName,
    },
  };

  return finalUserData;
};

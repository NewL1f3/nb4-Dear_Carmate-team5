import prisma from '../../lib/prisma';
import type { Prisma } from '@prisma/client';

// 이미지 업로드
export const uploadImage = async (createData: Prisma.ImageCreateInput) => {
  const image = await prisma.image.create({
    data: createData,
    select: {
      id: true,
      fileUrl: true,
    },
  });

  return image;
};

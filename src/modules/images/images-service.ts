import * as imageRepository from './images-repository';
import type { UploadImageData } from './images-dto';
import type { Prisma } from '@prisma/client';

// 이미지 업로드
export const uploadImage = async (data: UploadImageData) => {
  const { publicId, fileUrl } = data;

  const createData: Prisma.ImageCreateInput = {
    publicId,
    fileUrl,
  };

  const image = await imageRepository.uploadImage(createData);

  // 데이터 가공
  const imageData = {
    imageId: image.id,
    imageUrl: image.fileUrl,
  };

  return imageData;
};

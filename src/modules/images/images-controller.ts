import * as imageService from './images-service';
import type { Response } from 'express';
import type { UploadImageRequest } from './images-dto';
import { deleteFileFromCloudinary } from '../../lib/cloudinary-service';

// 이미지 업로드
export const uploadImage = async (req: UploadImageRequest, res: Response) => {
  if (!req.cloudinaryResult) {
    throw new Error('파일 업로드 정보가 필요합니다.');
  }

  const publicId = req.cloudinaryResult.public_id;
  const fileUrl = req.cloudinaryResult.secure_url;

  const data = { publicId, fileUrl };

  try {
    const imageData = await imageService.uploadImage(data);
    return res.status(201).json(imageData);

    // DB 저장 실패 시 롤백 (Cloudinary 파일 삭제)
  } catch (dbError) {
    console.error('DB 저장 실패! Cloudinary 롤백을 시작합니다.', dbError);
    await deleteFileFromCloudinary(publicId);

    return res.status(500).json({ message: '파일 정보를 저장하는 데 실패했습니다.' });
  }
};

import { v2 as cloudinary } from 'cloudinary';

// Cloudinary URL 생성 함수
export const createDownloadUrl = (publicId: string) => {
  const downloadUrl = cloudinary.url(publicId, {
    resource_type: 'raw',
    folder: 'contractdocuments',
    type: 'authenticated',
    flags: 'attachment',
    sign_url: true,
    // Cloudinary 키 만료 시간 30분
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    secure: true,
  });

  return downloadUrl;
};

// Cloudinary 롤백 함수
export const deleteFileFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      type: 'authenticated',
      resource_type: 'raw',
    });
    console.log(`롤백 성공: Cloudinary 파일 삭제 완료 - Public ID: ${publicId}`);
  } catch (err) {
    console.error(`롤백 실패: Cloudinary 파일 삭제 실패 - Public ID: ${publicId}`, err);
  }
};

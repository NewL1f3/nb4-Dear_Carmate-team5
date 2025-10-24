import type { Request } from 'express';

// ----------
// |  TYPE  |
// ----------

// 이미지 업로드
export interface UploadImageRequest extends Request {
  cloudinaryResult?: {
    secure_url: string;
    public_id: string;
    originalName: string;
  };
}

export interface UploadImageData {
  publicId: string;
  fileUrl: string;
}

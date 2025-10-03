import multer from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request } from 'express';

// 파일 타입과 해당 파일이 저장될 경로를 매핑
const uploadPaths: Record<string, string> = {
  contractDocuments: 'uploads/contractDocuments',
};

// 주어진 경로에 디렉토리가 없으면 생성하는 함수
const createDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage 설정을 생성하는 함수
const createStorage = (destination: string) => {
  createDirectory(destination); // 디렉토리 생성
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      // 파일명 중복을 피하기 위해 현재 시간을 앞에 추가
      const storageFileName = `${Date.now()}-${basename}${ext}`;

      cb(null, storageFileName);
    },
  });
};

// 업로드 타입에 대한 타입 별칭 정의
type UploadType = 'contractDocuments';

// 파일 필터 함수 (PDF 파일만 허용)
const contractDocumentFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    // 허용되지 않는 경우, 즉시 에러 콜백을 호출하고 함수를 종료
    return cb(new Error('계약서는 PDF 파일 형식만 지원합니다.'));
  }
  // 허용된 경우, 아래 코드가 실행됨
  cb(null, true);
};

// 업로드 유형에 따라 Multer 인스턴스를 생성하는 함수
const fileUploader = (type: UploadType) => {
  const destination = uploadPaths[type];

  if (destination === undefined) throw new Error('지원되지 않는 업로드 타입입니다.');

  return multer({
    storage: createStorage(destination),
    fileFilter: contractDocumentFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB 사이즈 제한
  });
};

// 각 용도에 맞는 미들웨어 인스턴스를 생성하여 내보냅니다.
export const contractDocumentFileUpload = fileUploader('contractDocuments').single('file');

// 여러 이미지 업로드가 필요한 경우 (예: .array('images', 5))
// export const productImagesUpload = createUploader('products').array('images', 5);

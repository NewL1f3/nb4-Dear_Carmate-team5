import { Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Busboy from 'busboy';
import type { UploadRequest } from '../modules/contract-documents/contract-documents-dto.js';

// 스트리밍 업로드 미들웨어 함수
export const cloudinaryStreamUploader = (req: UploadRequest, res: Response, next: NextFunction) => {
  const fileLimit = 20 * 1024 * 1024; // 20MB 제한

  // Busboy 인스턴스 생성
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      fileSize: fileLimit,
    },
  });
  // 파일이 요청에 포함되어 있는지 추적
  let fileFound = false;

  // 'file' 이벤트 리스너: 파일 스트림이 도착했을 때 처리
  busboy.on('file', (_fieldname, fileStream, info) => {
    const { filename, mimeType } = info;
    fileFound = true;

    if (mimeType !== 'application/pdf') {
      // 파일을 Cloudinary로 보내지 않고 스트림을 무시
      fileStream.resume();

      // 요청 파싱 완료를 기다린 후 에러 응답
      busboy.on('finish', () => {
        return res.status(400).json({
          message: '업로드할 수 없는 파일 형식입니다. PDF만 가능합니다.',
        });
      });
      return;
    }

    const publicId = `${Date.now()}-${filename}`;

    // Cloudinary 업로드 스트림 생성
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // 원시 파일
        folder: 'contractdocuments', // Cloudinary 내 저장할 폴더명
        public_id: publicId,
        type: 'authenticated',
      },
      (error, result) => {
        // 업로드 완료 후 콜백 함수 (실패)
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          // 이미 다른 에러로 응답이 전송되었는지 확인
          if (!res.headersSent) {
            return res.status(500).json({
              message: '파일 업로드 중 클라우드 오류 발생',
              error: error.message,
            });
          }
        }
        // 업로드 완료 후 콜백 함수 (성공)
        if (result) {
          // 성공 정보를 Request 객체에 저장
          req.cloudinaryResult = {
            secure_url: result.secure_url,
            public_id: result.public_id,
            originalName: filename,
          };

          next();
        }
      },
    );

    // 클라이언트 파일 스트림을 Cloudinary 스트림에 바로 연결
    // 서버 메모리에 데이터 저장 없음
    fileStream.pipe(uploadStream);
  });

  // 'filesLimit' 이벤트 리스너: 파일 크기 제한 초과 처리
  busboy.on('filesLimit', () => {
    if (res.headersSent) return;

    // 클라이언트 연결을 끊고 에러 응답
    req.unpipe(busboy);
    busboy.removeAllListeners();
    return res.status(413).json({
      message: `파일 크기가 제한(${fileLimit}MB)을 초과했습니다.`,
    });
  });

  // 'finish' 이벤트 리스너: 파일이 아예 없는 요청 처리
  busboy.on('finish', () => {
    if (!fileFound && !res.headersSent) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }
  });

  // 요청 스트림을 Busboy에 연결
  req.pipe(busboy);
};

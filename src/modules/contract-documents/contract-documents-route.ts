import express from 'express';
import * as contractDocumentController from './contract-documents-controller.js';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { validateId, validateGetQuery } from './contract-documents-dto.js';
import { contractDocumentUpload } from '../../middlewares/cloudinary-upload-middleware.js';
import { mockAuthMiddleware } from '../../middlewares/mock-auth-middleware.js';

const contractDocumentRouter = express.Router();

// 임시 로그인 목데이터
contractDocumentRouter.use(mockAuthMiddleware);

// 계약서 업로드 시 계약 목록 조회
contractDocumentRouter.get('/', validateGetQuery, asyncHandler(contractDocumentController.getContractDocuments));

// 계약서 추가 시 계약 목록 조회
contractDocumentRouter.get('/draft', asyncHandler(contractDocumentController.getContracts));

// 계약서 업로드
contractDocumentRouter.post(
  '/upload',
  contractDocumentUpload,
  asyncHandler(contractDocumentController.uploadContractDocument),
);

// 계약서 다운로드
contractDocumentRouter.get(
  '/:id/download',
  validateId,
  asyncHandler(contractDocumentController.downloadContractDocument),
);

export { contractDocumentRouter };

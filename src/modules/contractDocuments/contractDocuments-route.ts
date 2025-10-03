import express from 'express';
import * as contractDocumentController from './contractDocuments-controller.js';
import { contractDocumentFileUpload } from '../../middlewares/upload-middleware.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { validateId } from './contractDocuments-dto.js';

const contractDocumentRouter = express.Router();

// 계약서 업로드 시 계약 목록 조회
//contractDocumentRouter.get('/', asyncHandler(contractDocumentController.getContractDocuments));

// 게약서 추가 시 계약 목록 조회
contractDocumentRouter.get('/draft');

// 계약서 업로드
contractDocumentRouter.post(
  '/upload',
  contractDocumentFileUpload,
  asyncHandler(contractDocumentController.uploadContractDocument),
);

// 계약서 다운로드
contractDocumentRouter.get('/:id/download', validateId, contractDocumentController.downloadContractDocument);

export { contractDocumentRouter };

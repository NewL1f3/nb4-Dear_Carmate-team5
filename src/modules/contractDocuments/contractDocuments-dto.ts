import { z } from 'zod';
import { validateParams, validateQuery } from '../../middlewares/validate.middleware';
import type { ValidatedRequest } from '../../middlewares/validate.middleware';

// 계약서 업로드
export interface UploadContractDocumentData {
  fileName: string;
  fileUrl: string;
}

// 계약서 다운로드
export interface DownloadContractDocumentRequest extends ValidatedRequest {
  parsedParams: {
    id: number;
  };
}

// params
const idSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'ID는 숫자 형식이어야 합니다.').transform(Number),
  })
  .strict();

export const validateId = validateParams(idSchema);

// page
export const offsetSchema = z.coerce.number().min(1).max(100).default(0);
export const limitSchema = z.coerce.number().min(1).max(100).default(10);
export const orderSchema = z.string().optional();
export const searchSchema = z.string().optional();

// 모든 계약서 조회 (query)
const getContractDocumentsSchema = {
  query: z
    .object({
      offset: z.coerce.number().min(1).max(100).default(0),
      limit: z.coerce.number().min(1).max(100).default(10),
      order: z.string().optional(),
      search: z.string().optional(),
    })
    .strict(),
};

export const validateGetQuery = validateQuery(getContractDocumentsSchema);

import { z } from 'zod';
import { validateParams, validateQuery } from '../../middlewares/validate-middleware';
import type { ValidatedRequest } from '../../middlewares/validate-middleware';
import type { Request } from 'express';

// ----------
// |  TYPE  |
// ----------

// 계약서 업로드 시 계약 목록 조회
export interface GetContractDocumentsRequest extends ValidatedRequest {
  parsedQuery: GetContractDocumentsQuery;
}

export interface GetContractDocumentsQuery {
  searchBy?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// 계약서 업로드
export interface UploadContractDocumentRequest extends Request {
  cloudinaryResult?: {
    secure_url: string;
    public_id: string;
    originalName: string;
  };
}

export interface UploadContractDocumentData {
  fileName: string;
  fileUrl: string;
  publicId: string;
}

// 계약서 다운로드
export interface DownloadContractDocumentRequest extends ValidatedRequest {
  parsedParams: {
    id: number;
  };
}

// export interface CloudinaryPrivateDownloadOptions {
//   resource_type?: 'image' | 'video' | 'raw';
//   type?: 'upload' | 'authenticated' | 'private';
//   attachment?: boolean | string;
// }

// -----------------
// |  ZOD SCHEMAS  |
// -----------------

// query
const getContractDocumentsSchema = z
  .object({
    searchBy: z.string().max(100).optional(),
    keyword: z.string().max(100).optional(),
    page: z.coerce.number().min(1).max(100).default(1),
    pageSize: z.coerce.number().min(8).max(8).default(8),
  })
  .strict();

// params
const idSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'ID는 숫자 형식이어야 합니다.').transform(Number),
  })
  .strict();

// ----------------
// |  VALIDATORS  |
// ----------------

// query
export const validateGetQuery = validateQuery(getContractDocumentsSchema);

// params
export const validateId = validateParams(idSchema);

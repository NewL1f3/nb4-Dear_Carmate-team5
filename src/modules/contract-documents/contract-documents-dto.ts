import { z } from 'zod';
import { validateParams, validateQuery } from '../../middlewares/validate.middleware';
import type { ValidatedRequest } from '../../middlewares/validate.middleware';

// ----------
// |  TYPE  |
// ----------

// 계약서 업로드 시 계약 목록 조회
export interface GetContractDocumentsRequest extends ValidatedRequest {
  parsedQuery: {
    searchBy?: string;
    keyword?: string;
    page?: number;
  };
}

export interface GetContractDocumentsQuery {
  searchBy?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

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

// -----------------
// |  ZOD SCHEMAS  |
// -----------------

// query
const getContractDocumentsSchema = z
  .object({
    searchBy: z.string().max(100).optional(), //userName, contractName, carNumber, pageSize=8
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

import { z } from 'zod';
import { validateParams } from '../../middlewares/validateParams.middleware';

export interface UploadContractDocumentData {
  fileName: string;
  fileUrl: string;
}

// params
export const idSchema = z
  .object({
    id: z.string().regex(/^\d+$/, 'ID는 숫자 형식이어야 합니다.').transform(Number),
  })
  .strict();

export type IdParams = z.infer<typeof idSchema>;

export const validateId = validateParams(idSchema);

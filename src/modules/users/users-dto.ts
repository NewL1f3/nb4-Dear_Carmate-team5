import { z } from 'zod';
import { validateBody } from '../../middlewares/validate-middleware';
import type { ValidatedRequest } from '../../middlewares/validate-middleware';

// ----------
// |  TYPE  |
// ----------

// 유저 수정
export interface PatchMeRequest extends ValidatedRequest {
  parsedBody: PatchMeData;
}

export interface PatchMeData {
  currentPassword: string;
  employeeNumber: string;
  imageUrl: string;
  imageId: number;
  phoneNumber: string;
}

// -----------------
// |  ZOD SCHEMAS  |
// -----------------

// 유저 수정
const patchMeSchema = z
  .object({
    currentPassword: z.string().max(255),
    employeeNumber: z.string().max(10),
    imageUrl: z.string().max(255),
    imageId: z.number().min(1).max(100000000),
    phoneNumber: z.string().max(20),
  })
  .strict();

// ----------------
// |  VALIDATORS  |
// ----------------

// 유저 수정
export const validatePatchMe = validateBody(patchMeSchema);

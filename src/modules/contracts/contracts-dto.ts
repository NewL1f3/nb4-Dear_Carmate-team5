// modules/contracts/contracts-dto.ts
import { z } from 'zod';
import { ContractStatusEnum } from '@prisma/client';

export const contractResponseSchema = z.object({
  id: z.number(),
  status: z.string(),
  resolutionDate: z.string().nullable(),
  contractPrice: z.number().nullable(),
  meetings: z.array(
    z.object({
      id: z.number().optional(),
      date: z.string(),
      alarms: z.array(z.string()),
    }),
  ),
  user: z.object({ id: z.number(), name: z.string() }),
  customer: z.object({ id: z.number(), name: z.string() }),
  car: z.object({ id: z.number(), model: z.string() }),
});

export type ContractResponse = z.infer<typeof contractResponseSchema>;

// date 형식을 강도를 낮춰주는 함수
// 프론트에서 date를 ISO 8601형식으로 보내주지 않아서 .datetime을 사용 못함
const isValidDateString = (val: string) => {
  return !isNaN(new Date(val).getTime());
};

export const createContractSchema = z.object({
  carId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  meetings: z
    .array(
      z.object({
        date: z.string().refine(isValidDateString, { message: '유효한 날짜 형식이어야 합니다.' }),
        alarms: z.array(z.string().refine(isValidDateString)).default([]),
      }),
    )
    .min(1, '미팅 정보는 최소 1개 이상이어야 합니다.'),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;

export const updateContractSchema = z.object({
  status: z.nativeEnum(ContractStatusEnum).optional(),
  resolutionDate: z.string().refine(isValidDateString).nullable().optional(),
  contractPrice: z.number().int().nonnegative().optional(),
  userId: z.number().int().optional(),
  customerId: z.number().int().optional(),
  carId: z.number().int().optional(),
  meetings: z
    .array(
      z.object({
        date: z.string().refine(isValidDateString, { message: '유효한 날짜 형식이어야 합니다.' }),
        alarms: z.array(z.string().refine(isValidDateString)),
      }),
    )
    .optional(),
});

export type UpdateContractDto = z.infer<typeof updateContractSchema>;

// ----------
// |  TYPE  |
// ----------

// 계약과 게약서 관계 연결
export interface LinkContractData {
  id: number;
  fileName?: string;
}

// -----------------
// |  ZOD SCHEMAS  |
// -----------------

// 계약과 게약서 관계 연결
export const patchContractSchema = z
  .object({
    contractDocuments: z
      .array(
        z
          .object({
            id: z.number().int().min(1, 'ID는 1 이상의 정수여야 합니다.').max(100000000),
            fileName: z.string().max(100).optional(),
          })
          .strict(),
      )
      .max(5, '계약서는 최대 5개까지 업로드 가능합니다.'),
  })
  .strict();

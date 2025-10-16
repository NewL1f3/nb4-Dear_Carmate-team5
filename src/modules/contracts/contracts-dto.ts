// modules/contracts/contracts-dto.ts
import { z } from 'zod';
import { Contract, Meeting, User, ContractStatusEnum } from '@prisma/client';

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

export const createContractSchema = z.object({
  carId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  meetings: z
    .array(
      z.object({
        date: z.string().datetime({ message: '유효한 날짜 형식이어야 합니다.' }),
        alarms: z.array(z.string().datetime()).default([]),
      }),
    )
    .min(1, '미팅 정보는 최소 1개 이상이어야 합니다.'),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;

export const updateContractSchema = z.object({
  status: z.nativeEnum(ContractStatusEnum).optional(),
  resolutionDate: z.string().datetime().nullable().optional(),
  contractPrice: z.number().int().nonnegative().optional(),
  userId: z.number().int().optional(),
  customerId: z.number().int().optional(),
  carId: z.number().int().optional(),
  meetings: z
    .array(
      z.object({
        date: z.string().datetime(),
        alarms: z.array(z.string().datetime()),
      }),
    )
    .optional(),
});

export type UpdateContractDto = z.infer<typeof updateContractSchema>;

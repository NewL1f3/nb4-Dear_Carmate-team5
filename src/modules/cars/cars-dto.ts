// src/car/cars-dto.ts
import { z } from 'zod';

export const createCarSchema = z.object({
  modelId: z.number().int().positive().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  carNumber: z.string().min(1, '차량 번호는 필수입니다.'),
  manufacturingYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  mileage: z.number().int().nonnegative(),
  price: z.number().int().nonnegative(),
  accidentCount: z.number().int().nonnegative().default(0),
  explanation: z.string().optional(),
  accidentDetails: z.string().optional(),
});

export type CreateCarDto = z.infer<typeof createCarSchema>;

export const updateCarSchema = createCarSchema.partial();
export type UpdateCarDto = z.infer<typeof updateCarSchema>;

export const csvCarRecordSchema = z.object({
  carNumber: z.string().min(1, '차량 번호는 필수입니다.'),
  manufacturer: z.string().min(1, '제조사는 필수입니다.'),
  model: z.string().min(1, '모델명은 필수입니다.'),
  manufacturingYear: z.string().transform((val, ctx) => {
    const num = Number(val);
    const currentYear = new Date().getFullYear();
    if (isNaN(num) || num < 1900 || num > currentYear + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `제조년도는 1900~${currentYear + 1} 사이여야 합니다.`,
      });
      return z.NEVER;
    }
    return num;
  }),
  mileage: z.string().transform((val, ctx) => {
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '주행거리는 0 이상이어야 합니다.',
      });
      return z.NEVER;
    }
    return num;
  }),
  price: z.string().transform((val, ctx) => {
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '가격은 0 이상이어야 합니다.',
      });
      return z.NEVER;
    }
    return num;
  }),
  accidentCount: z
    .string()
    .optional()
    .default('0')
    .transform((val, ctx) => {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '사고 횟수는 0 이상이어야 합니다.',
        });
        return z.NEVER;
      }
      return num;
    }),
  explanation: z.string().optional().default(''),
  accidentDetails: z.string().optional().default(''),
});

export type CsvCarRecordDto = z.infer<typeof csvCarRecordSchema>;

export const csvUploadSchema = z.object({
  records: z.array(csvCarRecordSchema).min(1, 'CSV 파일이 비어있습니다.'),
});

export type CsvUploadDto = z.infer<typeof csvUploadSchema>;

import z from 'zod';

//customer
//nullable 추가 필요
export const customerBodySchema = z.object({
  name: z.string(),
  gender: z.enum(['male', 'female']),
  phoneNumber: z.string(),
  ageGroup: z.enum(['10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대']),
  region: z.enum([
    '서울',
    '경기',
    '인천',
    '강원',
    '충북',
    '충남',
    '세종',
    '대전',
    '전북',
    '전남',
    '광주',
    '경북',
    '경남',
    '대구',
    '울산',
    '부산',
    '제주',
  ]),
  email: z.string(),
  memo: z.string(),
});

export const customerIdSchema = z.object({
  customerId: z.number().int(),
});

export const getManyCustomerSchema = z.object({
  pageNum: z.number().int().default(1),
  pagesizeNum: z.number().int().default(8),
  searchBy: z.enum(['name', 'email']).default('name'),
  keyword: z.string(),
});

//

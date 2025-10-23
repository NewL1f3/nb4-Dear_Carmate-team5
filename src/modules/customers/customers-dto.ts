import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';
import type { Customer, Company, Prisma } from '@prisma/client';
import { Request } from 'express';
import z from 'zod';
//controller에서 사용
// import { CustomerSearchParams } from './customers-dto';
export enum regionEnumEng {
  seoul,
  gyeonggi,
  incheon,
  gangwon,
  chungbuk,
  chungnam,
  sejong,
  daejeon,
  jeonbuk,
  jeonnam,
  gwangju,
  gyeongbuk,
  gyeongnam,
  daegu,
  ulsan,
  busan,
  jeju,
}

export interface customer {
  id: number;
  companyId: number;
  name: string;
  gender: GenderEnum;
  phoneNumber: string;
  ageGroup: string | null;
  region: string | null;
  email: string;
  memo: string | null;
  contractCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface responseFormat {
  id: number;
  name: string;
  gender: GenderEnum;
  phoneNumber: string;
  ageGroup: string | null;
  region: string | null;
  email: string;
  memo: string | null;
  contractCount: number;
}

export type SearchBy = 'name' | 'email';

export interface CustomerSearchParams {
  page: string;
  pageSize: string;
  searchBy: SearchBy;
  keyword: string;
}

//

//service에서 사용

export interface User {
  id: number;
  companyId: number;
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  imageUrl: string;
  isAdmin: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface postServiceInput {
  companyId: number;
  data: any;
  userId: number;
}

export interface getManyServiceInput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
  companyId: number;
  userId: number;
}

export interface patchServiceInput {
  data: patchServiceMediumData;
  customerId: number;
  companyId: number;
  userId: number;
}

export interface patchServiceMediumData {
  name: string;
  gender: string;
  phoneNumber: string;
  ageGroup: string | null;
  region: string | null;
  email: string;
  memo: string;
}

//repository에서 사용
export interface getManyRepoInput {
  where: any;
  limit: number;
  skip: number;
  companyId: number;
}

export interface createData extends Customer {
  company: any;
}

export interface updatedData extends Prisma.CustomerUpdateInput {
  company: any;
}

//

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

export interface customerRequest extends Request {
  user?: any;
}

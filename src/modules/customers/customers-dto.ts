import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';
import type { Customer, Company, Prisma } from '@prisma/client';

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
}

export interface getManyServiceInput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
}

export interface patchServiceInput {
  data: patchServiceMediumData;
  customerId: number;
  companyId: number;
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
  searchBy: string;
  limit: number;
  skip: number;
  keyword: string;
}

export interface createData extends Customer {
  company: any;
}

export interface updatedData extends Prisma.CustomerUpdateInput {
  company: any;
}

//

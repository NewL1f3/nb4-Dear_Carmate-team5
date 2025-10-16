import prisma from '../../lib/prisma';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';
import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';
import { customerBodySchema, customerIdSchema, getManyCustomerSchema } from '../../lib/zod';
import { number } from 'zod';
import Busboy from 'busboy';
import csv from 'csv-parser';
import { Readable } from 'stream';
import customerRepository from './customer-repository';

interface responseFormat {
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

interface User {
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

interface customer {
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

interface postInput {
  companyId: number;
  data: any;
}

interface getManyInput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
}

interface patchInput {
  data: patchMediumData;
  customerId: number;
  companyId: number;
}

interface patchMediumData {
  name: string;
  gender: string;
  phoneNumber: string;
  ageGroup: string | null;
  region: string | null;
  email: string;
  memo: string;
}

class customerService {
  postCustomer = async function ({ companyId, data }: postInput) {
    const bodyParsed = customerBodySchema.safeParse(data);
    if (!bodyParsed.success) {
      throw badRequestError;
    }
    let { region, ageGroup, ...otherData } = data;

    if (region) {
      region = regionKorToEng(region);
    }
    if (ageGroup) {
      ageGroup = ageKorToEng(ageGroup);
    }

    const mediumData = { region, ageGroup, ...otherData };
    const newData = {
      ...mediumData,
      company: {
        connect: { id: companyId },
      },
    };

    const newCustomer = await customerRepository.createCustomer(newData);

    return newCustomer;
  };

  getManyCustomer = async function ({ page, pageSize, searchBy, keyword }: getManyInput) {
    //type 변환하기
    const pageNum: number = +page;
    const pageSizeNum: number = +pageSize;
    const newParams = { pageNum, pageSizeNum, searchBy, keyword };

    // 유효성 검사 하기
    const paramParsed = getManyCustomerSchema.safeParse(newParams);
    if (!paramParsed.success) {
      throw badRequestError;
    }

    //limit, skip 구하기
    const limit = pageSizeNum;
    const skip = pageSizeNum * (pageNum - 1);

    const customers = await customerRepository.getManyCustomers({ limit, skip, keyword, searchBy });

    //프론트에서 요구하는 값 구하기
    const customerCount = await customerRepository.countCustomers();

    const currentPage = page;
    const totalPages = Math.floor(customerCount / pageSizeNum) + 1;
    const totalItemCount = customerCount;

    //customers 포매팅
    let formattedCustomers = [];
    if (customers) {
      for (let data of customers) {
        const formattedCustomer = responseFomatiing(data);
        formattedCustomers.push(formattedCustomer);
      }
    }

    //프론트 형식에 맞는 response 전달
    const returnData = {
      currentPage,
      totalPages,
      totalItemCount,
      data: formattedCustomers,
    };
    return returnData;
  };
  patchCustomer = async function ({ data, customerId, companyId }: patchInput) {
    let { ageGroup, region, gender, ...otherData } = data;

    //한글 영어로 변환
    if (ageGroup) {
      ageGroup = ageKorToEng(ageGroup);
    }
    if (region) {
      region = regionKorToEng(region);
    }

    //customer가 없을 시 에러 발생
    try {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId },
      });
      if (!customer) {
        throw noCustomerError;
      }
    } catch (error) {
      throw databaseCheckError;
    }

    // 유효성 검사
    const bodyParsed = customerBodySchema.safeParse(data);
    if (!bodyParsed.success) {
      throw badRequestError;
    }

    //format을 바꾸어 데이터 재정립
    const newData = {
      ageGroup: ageGroup as AgeGroupEnum,
      region: region as RegionEnum,
      gender: gender as GenderEnum,
      ...otherData,
      company: {
        connect: { id: companyId },
      },
    };

    //데이터 업데이트
    let patchCustomer;
    try {
      patchCustomer = await prisma.customer.update({
        data: newData,
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }

    //front에 맞게 formatting
    const response = responseFomatiing(patchCustomer);
    return response;
  };
  deleteCustomer = async function (customerId: number) {
    //customer 존재 확인
    try {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId },
      });
      if (!customer) {
        throw noCustomerError;
      }
    } catch (error) {
      throw databaseCheckError;
    }

    //customer 삭제
    try {
      await prisma.customer.delete({
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }
  };

  getOneCustomer = async function (customerId: number) {
    let customer;
    //customer 있는지 확인

    try {
      customer = await prisma.customer.findFirst({
        where: { id: customerId },
      });
      if (!customer) {
        throw noCustomerError;
      }
    } catch (error) {
      throw databaseCheckError;
    }

    const response = responseFomatiing(customer);
    return response;
  };

  uploadCustomer = async function () {};
}

function responseFomatiing(customer: customer) {
  if (customer.ageGroup) {
    let response: responseFormat = {
      id: customer.id,
      name: customer.name,
      gender: customer.gender,
      phoneNumber: customer.phoneNumber,
      ageGroup: ageEngToKor(customer.ageGroup),
      region: regionEngToKor(customer.region),
      email: customer.email,
      memo: customer.memo,
      contractCount: customer.contractCount,
    };
    return response;
  }
}

function regionEngToKor(Eng: string | null) {
  let result = null;
  const regionMap: Record<string, string> = {
    seoul: '서울',
    gyeonggi: '경기',
    incheon: '인천',
    gangwon: '강원',
    chungbuk: '충북',
    chungnam: '충남',
    sejong: '세종',
    daejeon: '대전',
    jeonbuk: '전북',
    jeonnam: '전남',
    gwangju: '광주',
    gyeongbuk: '경북',
    gyeongnam: '경남',
    daegu: '대구',
    ulsan: '울산',
    busan: '부산',
    jeju: '제주',
  };
  if (Eng) {
    result = regionMap[Eng];
  }

  return result;
}

function regionKorToEng(kor: string | null) {
  const regionMap: Record<string, string> = {
    서울: 'seoul',
    경기: 'gyeonggi',
    인천: 'incheon',
    강원: 'gangwon',
    충북: 'chungbuk',
    충남: 'chungnam',
    세종: 'sejong',
    대전: 'daejeon',
    전북: 'jeonbuk',
    전남: 'jeonnam',
    광주: 'gwangju',
    경북: 'gyeongbuk',
    경남: 'gyeongnam',
    대구: 'daegu',
    울산: 'ulsan',
    부산: 'busan',
    제주: 'jeju',
  };
  let result = null;
  if (kor) {
    result = regionMap[kor];
  }
  return result;
}

function ageEngToKor(Eng: string | null) {
  const ageMap: Record<string, string> = {
    ten: '10대',
    twenty: '20대',
    thirty: '30대',
    forty: '40대',
    fifty: '50대',
    sixty: '60대',
    seventy: '70대',
    eighty: '80대',
  };
  let result = null;
  if (Eng) {
    result = ageMap[Eng];
  }
  return result;
}

function ageKorToEng(Kor: string | null) {
  const ageMap: Record<string, string> = {
    '10대': 'ten',
    '20대': 'twenty',
    '30대': 'thirty',
    '40대': 'forty',
    '50대': 'fifty',
    '60대': 'sixty',
    '70대': 'seventy',
    '80대': 'eighty',
  };
  let result = null;
  if (Kor) {
    result = ageMap[Kor];
  }
  return result;
}

export default new customerService();

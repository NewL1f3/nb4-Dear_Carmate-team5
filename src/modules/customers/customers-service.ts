import prisma from '../../lib/prisma';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';

import customerRepository from './customers-repository';

import { customerBodySchema, customerIdSchema, getManyCustomerSchema } from '../../lib/zod';
import {
  responseFormat,
  User,
  customer,
  postServiceInput,
  getManyServiceInput,
  patchServiceInput,
} from './customers-dto';
import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';

class customerService {
  postCustomer = async function ({ companyId, data }: postServiceInput) {
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

  getManyCustomer = async function ({ page, pageSize, searchBy, keyword }: getManyServiceInput) {
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

  patchCustomer = async function ({ data, customerId, companyId }: patchServiceInput) {
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

    const patchCustomer = await customerRepository.updatedCustomers(newData, customerId);
    //front에 맞게 formatting
    const response = responseFomatiing(patchCustomer);
    return response;
  };

  deleteCustomer = async function (customerId: number) {
    //customer 존재 확인
    const customer = await customerRepository.findCustomer(customerId);
    if (!customer) {
      throw noCustomerError;
    }

    //customer 삭제
    await customerRepository.deleteCustomer(customerId);
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

  uploadCustomers = async function (rows: any[], companyId: number) {
    const requiredFields = ['name', 'email'];
    const formattedRows: any[] = [];

    for (const [index, row] of rows.entries()) {
      formattedRows.push({
        name: row.name,
        gender: row.gender || null,
        phoneNumber: row.phoneNumber || null,
        ageGroup: ageFormatting(row.ageGroup) || null,
        region: regionKorToEng(row.region) || null,
        email: row.email || null,
        memo: row.memo || null,
        companyId,
      });
    }

    await customerRepository.createMany(formattedRows);

    return { message: '데이터 생성 완료', total: formattedRows.length };
  };
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

function ageFormatting(ageGroup: string) {
  const ageMap: Record<string, string> = {
    '10-20': 'ten',
    '20-30': 'twenty',
    '30-40': 'thirty',
    '40-50': 'forty',
    '50-60': 'fifty',
    '60-70': 'sixty',
    '70-80': 'seventy',
    '80-90': 'eighty',
  };
  let result = null;
  if (ageGroup) {
    result = ageMap[ageGroup];
  }
  return result;
}

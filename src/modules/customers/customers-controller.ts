import prisma from '../../lib/prisma';
import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';
import { customerBodySchema, customerIdSchema, getManyCustomerSchema } from '../../lib/zod';
import { Request, Response, NextFunction, request } from 'express';
import Busboy from 'busboy';
import csv from 'csv-parser';
import { Readable } from 'stream';
import customerService from './customer-service';

//controller

enum regionEnumEng {
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

interface postInputData {
  phoneNumber: string;
  email: string;
  name: string;
  gender: GenderEnum;
}

type SearchBy = 'name' | 'email';

interface CustomerSearchParams {
  page: string;
  pageSize: string;
  searchBy: SearchBy;
  keyword: string;
}

//마지막에 formatting 필요(영어 -> 한글, createdAt, updatedAt 삭제)
//response formatting 필요(createdAt, updatedAt 빼기)

export class customerController {
  postCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 실제 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });
    if (!user) {
      throw unauthorizedError;
    }

    const companyId = user.companyId;

    let data = req.body;
    let newCustomer = customerService.postCustomer({ companyId, data });

    return res.status(201).send(newCustomer);
  };

  getManyCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 정석 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    if (!user) {
      throw unauthorizedError;
    }

    let { page = '1', pageSize = '8', searchBy = 'name', keyword = '' } = req.query as unknown as CustomerSearchParams;

    const returnData = await customerService.getManyCustomer({ page, pageSize, searchBy, keyword });

    return res.status(200).send(returnData);
  };

  patchCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 정석 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 2 },
    });

    //user가 없을 시 에러 발생
    if (!user) {
      throw unauthorizedError;
    }

    const companyId = user.companyId;
    let customerId = +req.params.customerId;
    let data = req.body;

    if (typeof customerId !== 'number') {
      throw badRequestError;
    }

    const response = await customerService.patchCustomer({ data, customerId, companyId });
    return res.status(200).send(response);
  };

  deleteCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const customerId = +req.params.customerId;
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }

    // 원래 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 2 },
    });
    if (!user) {
      throw unauthorizedError;
    }

    await customerService.deleteCustomer(customerId);

    return res.status(204).send({ message: `고객 삭제 성공` });
  };

  getOneCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const customerId = +req.params.customerId;
    //customerId 유효성 검사
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }
    // 원래 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 2 },
    });

    if (!user) {
      throw unauthorizedError;
    }

    const response = await customerService.getOneCustomer(customerId);
    return res.status(200).send(response);
  };

  uploadCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const result = await customerService.uploadCustomer(req);
    if (result) {
      res.status(201).send({ message: '성공적으로 등록되었습니다' });
    }
  };
}

export default new customerController();

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

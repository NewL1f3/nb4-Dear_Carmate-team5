import prisma from '../lib/prisma';
import { GenderEnum } from '@prisma/client';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../lib/errors';
import { customerBodySchema, customerIdSchema, getManyCustomerSchema } from '../lib/zod';
import { Request, Response, NextFunction } from 'express';
//controller

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

    const bodyParsed = customerBodySchema.safeParse(data);
    if (!bodyParsed.success) {
      console.log('에러 테스트용 코드 1');
      throw badRequestError;
    }
    let { region, ageGroup, ...otherData } = data;

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

    region = regionMap[region];
    ageGroup = ageMap[ageGroup];
    const mediumData = { region, ageGroup, ...otherData };
    const newData = {
      ...mediumData,
      company: {
        connect: { id: companyId },
      },
    };

    let newCustomer;
    try {
      newCustomer = await prisma.customer.create({
        data: newData,
      });
    } catch (error) {
      // throw databaseCheckError;
      console.error(error);
    }

    return res.status(201).send(newCustomer);
  };
  //마지막에 formatting 필요(영어 -> 한글, createdAt, updatedAt 삭제)
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

    let { page = 1, pageSize = 8, searchBy = 'name', keyword = '' } = req.query as unknown as CustomerSearchParams;

    const pageNum: number = +page;
    const pageSizeNum: number = +pageSize;
    const newParams = { pageNum, pageSizeNum, searchBy, keyword };
    const paramParsed = getManyCustomerSchema.safeParse(newParams);
    if (!paramParsed.success) {
      throw badRequestError;
    }

    const limit = pageSizeNum;
    const skip = pageSizeNum * (pageNum - 1);
    let customers;
    if (searchBy == 'name') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          name: {
            contains: keyword,
          },
        },
      });
    }
    if (searchBy == 'email') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          email: {
            contains: keyword,
          },
        },
      });
    }

    const customerCount = await prisma.customer.count({});

    const currentPage = page;
    const totalPages = Math.floor(customerCount) + 1;
    const totalItemCount = customerCount;

    const returnData = {
      currentPage,
      totalPages,
      totalItemCount,
      data: customers,
    };
    return res.status(200).send(returnData);
  };

  //마지막에 formatting 필요(영어 -> 한글, createdAt, updatedAt 삭제)
  patchCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 정석 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 2 },
    });

    if (!user) {
      throw unauthorizedError;
    }
    const companyId = user.companyId;

    let customerId = +req.params.customerId;
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }

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

    let data = req.body;

    const bodyParsed = customerBodySchema.safeParse(data);
    if (!bodyParsed.success) {
      throw badRequestError;
    }

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
    let { ageGroup, region, ...otherData } = data;

    ageGroup = ageMap[ageGroup];
    region = regionMap[region];

    const newData = {
      ageGroup,
      region,
      ...otherData,
      company: {
        connect: { id: companyId },
      },
    };
    let patchCustomer;

    try {
      patchCustomer = await prisma.customer.update({
        data: newData,
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }

    return res.status(200).send(patchCustomer);
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

    try {
      await prisma.customer.delete({
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }

    return res.status(204).send({ message: `고객 삭제 성공` });
  };

  getOneCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const customerId = +req.params;
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }
    const user = req.user;
    if (!user) {
      throw unauthorizedError;
    }

    let customer;
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

    return res.status(200).send(customer);
  };

  uploadCustomer = async function (req: Request, res: Response, next: NextFunction) {
    /*
      1. multer를 통하여 file을 받아온다
      2. 저장된 csv파일을 js에서 처리하기 쉬운 형식으로 바꾼다.
      3. prisma 데이터 셋으로 치환한다(createMany 또는 create). 
      4. 
    */
  };
}

export default new customerController();

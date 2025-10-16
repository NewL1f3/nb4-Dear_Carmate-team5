import prisma from '../../lib/prisma';
import { AgeGroupEnum, GenderEnum, RegionEnum } from '@prisma/client';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';
import { customerBodySchema, customerIdSchema, getManyCustomerSchema } from '../../lib/zod';
import { Request, Response, NextFunction } from 'express';
import Busboy from 'busboy';
import csv from 'csv-parser';
import { Readable } from 'stream';
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

    const bodyParsed = customerBodySchema.safeParse(data);
    if (!bodyParsed.success) {
      console.log('에러 테스트용 코드 1');
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

    let formattedCustomers = [];
    if (customers) {
      for (let data of customers) {
        const formattedCustomer = responseFomatiing(data);
        formattedCustomers.push(formattedCustomer);
      }
    }

    const returnData = {
      currentPage,
      totalPages,
      totalItemCount,
      data: formattedCustomers,
    };

    return res.status(200).send(returnData);
  };

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

    let { ageGroup, region, ...otherData } = data;

    if (ageGroup) {
      ageGroup = ageKorToEng(ageGroup);
    }
    if (region) {
      region = regionKorToEng(region);
    }

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

    const response = responseFomatiing(patchCustomer);
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

    const response = responseFomatiing(customer);
    return res.status(200).send(response);
  };

  uploadCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', (fieldname: string, file: Readable, filename: string, encoding: string, mimetype: string) => {
      if (mimetype !== 'text/csv') {
        res.status(400).json({ error: 'CSV 파일만 업로드할 수 있습니다.' });
        return;
      }

      let rows: any[] = [];
      file
        .pipe(csv())
        .on('data', (row) => {
          rows.push({
            name: row.name,
            gender: row.gender || null,
            phoneNumber: row.phoneNumber || null,
            ageGroup: row.ageGroup || null,
            region: row.region || null,
            email: row.email || null,
            memo: row.memo || null,
          });
        })
        //여기부분 필수필드랑 아닌거 구분하기
        .on('end', async () => {
          console.log('CSV 파싱 완료, 총 행:', rows.length);

          try {
            const result = await prisma.customer.createMany({ data: rows });
            res.status(201).send({ message: '성공적으로 등록되었습니다' });
          } catch (err) {
            console.error(err);
            throw new Error('데이터 생성 오류');
          }
        });
    });

    req.pipe(busboy);
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

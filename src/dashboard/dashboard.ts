import prisma from '../lib/prisma.js';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../lib/errors';
import { Request, Response, NextFunction } from 'express';
//controller
// 전체적으로 company 로직 추가
async function getDashboard(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    throw unauthorizedError;
  }
  let company;
  const companyId = user.companyId;
  try {
    company = await prisma.company.findUnique({
      where: { id: companyId },
    });
  } catch (error) {
    throw databaseCheckError;
  }

  if (!company) {
    throw serverError;
  }

  // 이달의 매출
  const now = new Date();
  const thisMonthStartDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySales: any = await prisma.contract.aggregate({
    _sum: {
      contractPrice: true,
    },
    where: {
      createdAt: {
        gte: thisMonthStartDay, //보다 큰거
      },
    },
  });

  // 저번달 매출
  const lastMonthStartDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthSales: any = await prisma.contract.aggregate({
    _sum: {
      contractPrice: true,
    },
    where: {
      resolutionDate: {
        gte: lastMonthStartDay, //보다 큰거
        lt: thisMonthStartDay,
      },
    },
  });

  // 이번달 매출 상승률
  const growthRate = (100 * monthlySales) / lastMonthSales;

  // 진행중인 계약
  // typescirpt로 변형시  Prisma.ContractStatus.carInspection와 같은 형태로 변경
  const proceedingContrastCount = await prisma.contract.count({
    where: {
      status: {
        in: ['carInspection', 'priceNegotiation', 'contractDraft'],
      },
    },
  });

  // 성사된 계약수
  const completedContrastCount = await prisma.contract.count({
    where: {
      status: 'contractSuccessful',
    },
  });

  //   차량타입별 계약수
  // const contractsByCarType = await prisma.model.groupBy({
  //   by: ['type'],
  //   _count: { contracts: true },
  // });

  /*결과: 
    {
                "carType": "SEDAN",
                "count": 5
            },
            {
                "carType": "COMPACT",
                "count": 1
            },
            {
                "carType": "세단",
                "count": 4
            },
            {
                "carType": "경차",
                "count": 1
            }
    */

  /*
const cars = await prisma.car.findMany({
  select: {
    id: true,
    model: {
      select: {
        type: true,
      },
    },
    _count: {
      select: {
        contracts: true, // 각 Car별 계약 수
      },
    },
  },
});

type CountByCarType = Record<string, number>;

const contractsByCarType: CountByCarType = {};

for (const car of cars) {
  const type = car.model.type;
  const count = car._count.contracts;

  if (!contractsByCarType[type]) contractsByCarType[type] = 0;
  contractsByCarType[type] += count;
}

console.log(contractsByCarType);
결과 예시:

ts
코드 복사
{
  SUV: 12,
  SEDAN: 5,
  TRUCK: 3
}



*/

  // 차량타입별 매출액
  const salesByCarType = 1;

  /*  
결과:
  {
            "carType": "SEDAN",
            "count": 173049537
        },
        {
            "carType": "COMPACT",
            "count": 19656433
        },
        {
            "carType": "세단",
            "count": 58900900
        },
        {
            "carType": "경차",
            "count": 10000000
        }
  */
  // const result = {
  //   monthlySales,
  //   lastMonthSales,
  //   growthRate,
  //   proceedingContrastCount,
  //   completedContrastCount,
  //   contractsByCarType,
  //   salesByCarType,
  // };

  // return res.status(200).send(result);
}

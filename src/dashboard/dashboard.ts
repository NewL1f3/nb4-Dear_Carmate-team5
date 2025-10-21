import prisma from '../lib/prisma';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../lib/errors';
import { Request, Response, NextFunction } from 'express';
//controller

// 전체적으로 company 로직 추가
export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  // const user = req.user;
  const user = await prisma.user.findFirst();
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
  const monthlySalesMedium: any = await prisma.contract.aggregate({
    _sum: {
      contractPrice: true,
    },
    where: {
      companyId,
      createdAt: {
        gte: thisMonthStartDay, //보다 큰거
      },
    },
  });
  const monthlySales: number = monthlySalesMedium._sum.contractPrice;

  // 저번달 매출
  const lastMonthStartDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthSalesMedium: any = await prisma.contract.aggregate({
    _sum: {
      contractPrice: true,
    },
    where: {
      companyId,
      resolutionDate: {
        gte: lastMonthStartDay, //보다 큰거
        lt: thisMonthStartDay,
      },
    },
  });
  const lastMonthSales: number = lastMonthSalesMedium._sum.contractPrice ? lastMonthSalesMedium._sum.contractPrice : 0;

  // 이번달 매출 상승률
  const growthRate = (100 * monthlySales) / lastMonthSales;

  // 진행중인 계약
  // typescirpt로 변형시  Prisma.ContractStatus.carInspection와 같은 형태로 변경
  const proceedingContrastCount = await prisma.contract.count({
    where: {
      companyId,
      status: {
        in: ['carInspection', 'priceNegotiation', 'contractDraft'],
      },
    },
  });

  // 성사된 계약수
  const completedContrastCount = await prisma.contract.count({
    where: {
      companyId,
      status: 'contractSuccessful',
    },
  });

  //   차량타입별 계약수

  // const contractsByCarType = await prisma.model.groupBy({
  //   by: ['type'],
  //   _count: { contracts: true },
  // });

  const cars = await prisma.car.findMany({
    where: { companyId },
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

  const contractsByCarTypeMedium: CountByCarType = {};

  for (const car of cars) {
    const type = car.model.type;
    const count = car._count.contracts;

    if (!contractsByCarTypeMedium[type]) {
      contractsByCarTypeMedium[type] = 0;
    }

    contractsByCarTypeMedium[type] += count;
  }

  const contractsByCarType = [];
  for (const key in contractsByCarTypeMedium) {
    const newObject = {
      carType: key,
      count: contractsByCarTypeMedium[key],
    };
    contractsByCarType.push(newObject);
  }

  console.log(contractsByCarType);

  // 차량타입별 매출액
  const carPriceByModelId = await prisma.car.groupBy({
    by: ['modelId'],
    _sum: {
      price: true,
    },
    where: { companyId },
  });
  console.log(carPriceByModelId);

  const salesByCarTypeMedium = await Promise.all(
    carPriceByModelId.map(async (item) => {
      const model = await prisma.model.findUnique({
        where: { id: item.modelId },
        select: { type: true },
      });
      return {
        carType: model?.type,
        count: item._sum.price ?? 0,
      };
    }),
  );

  const salesByCarType = Object.values(
    salesByCarTypeMedium.reduce(
      (acc, cur) => {
        if (!cur.carType) return acc;
        if (!acc[cur.carType]) acc[cur.carType] = { carType: cur.carType, count: 0 };
        acc[cur.carType].count += cur.count;
        return acc;
      },
      {} as Record<string, { carType: string; count: number }>,
    ),
  );

  console.log(salesByCarType);
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
  const result = {
    monthlySales,
    lastMonthSales,
    growthRate,
    proceedingContrastCount,
    completedContrastCount,
    contractsByCarType,
    salesByCarType,
  };

  return res.status(200).send(result);
}

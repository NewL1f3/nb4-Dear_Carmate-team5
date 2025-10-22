import prisma from '../../lib/prisma';
import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';
import { Request, Response, NextFunction } from 'express';
import dashboardService from './dashboard-service';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  //유저 불러오기 및 로그인 확인

  // const user = req.user;
  const user = await prisma.user.findFirst();
  if (!user) {
    throw unauthorizedError;
  }

  const companyId = user.companyId;
  //user가 속하는 company가 있는지 확인
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw serverError;
    }
  } catch (error) {
    throw databaseCheckError;
  }

  // 이달의 매출
  const monthlySales = await dashboardService.getThisMonthSales(companyId);

  // 저번달 매출
  const lastMonthSales = await dashboardService.getLastMonthSales(companyId);

  // 이번달 매출 상승률
  let growthRate;
  if (lastMonthSales != 0) {
    growthRate = (100 * monthlySales) / lastMonthSales;
  } else {
    growthRate = 1;
  }

  // 진행중인 계약
  const proceedingContractsCount = await dashboardService.getProceedingContractsCount(companyId);

  // 성사된 계약수
  const completedContractsCount = await dashboardService.getCompletedContractsCount(companyId);

  //   차량타입별 계약수
  const contractsByCarType = await dashboardService.getContractsByCarType(companyId);

  // 차량타입별 매출액
  const salesByCarType = await dashboardService.getSalesByCarType(companyId);

  const result = {
    monthlySales,
    lastMonthSales,
    growthRate,
    proceedingContractsCount,
    completedContractsCount,
    contractsByCarType,
    salesByCarType,
  };

  return res.status(200).send(result);
}

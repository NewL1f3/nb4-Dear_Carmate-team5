import dashboardRepository from './dashboard-repository';
import { serverError, databaseCheckError } from '../../lib/errors';

class dashboardService {
  getThisMonthSales = async function (companyId: number) {
    const now = new Date();
    const thisMonthStartDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStartDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlySalesMedium: any = await dashboardRepository.aggregatePrice(
      companyId,
      thisMonthStartDay,
      nextMonthStartDay,
    );
    const monthlySales: number = monthlySalesMedium._sum.contractPrice ? monthlySalesMedium._sum.contractPrice : 0;

    return monthlySales;
  };

  getLastMonthSales = async function (companyId: number) {
    const now = new Date();
    const thisMonthStartDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStartDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const lastMonthSalesMedium: any = await dashboardRepository.aggregatePrice(
      companyId,
      lastMonthStartDay,
      thisMonthStartDay,
    );

    const lastMonthSales: number = lastMonthSalesMedium._sum.contractPrice
      ? lastMonthSalesMedium._sum.contractPrice
      : 0;

    return lastMonthSales;
  };

  getProceedingContractsCount = async function (companyId: number) {
    const proceedingContractCount = await dashboardRepository.getProceedingContractCount(companyId);
    return proceedingContractCount;
  };

  getCompletedContractsCount = async function (companyId: number) {
    const completedContractsCount = await dashboardRepository.getCompletedContractCount(companyId);
    return completedContractsCount;
  };

  getContractsByCarType = async function (companyId: number) {
    //car model과 contract 개수 같이 출력하기
    const cars = await dashboardRepository.getContractCountWithCarType(companyId);

    type CountByCarType = Record<string, number>;

    const contractsByCarTypeMedium: CountByCarType = {};

    //모든 car의 type별로 contract 개수 합하기
    for (const car of cars) {
      const type = car.model.type;
      const count = car._count.contracts;

      if (!contractsByCarTypeMedium[type]) {
        contractsByCarTypeMedium[type] = 0;
      }

      contractsByCarTypeMedium[type] += count;
    }

    //response 형식으로 formatting 하기
    let contractsByCarType = [];
    for (const key in contractsByCarTypeMedium) {
      const newObject = {
        carType: key,
        count: contractsByCarTypeMedium[key],
      };
      contractsByCarType.push(newObject);
    }
    contractsByCarType = contractsByCarType.filter((contract) => contract.count != 0);
    return contractsByCarType;
  };

  getSalesByCarType = async function (companyId: number) {
    const successfulCarIds = await dashboardRepository.getSuccesCarIds(companyId);
    const successCarIds = await successfulCarIds.map((c) => c.carId);

    const carPriceByModelId = await dashboardRepository.getPriceByModelId(companyId, successCarIds);

    const salesByCarTypeMedium = await Promise.all(
      carPriceByModelId.map(async (item) => {
        const findedModel = await dashboardRepository.findModelName(item);
        return {
          carType: findedModel?.type,
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
    return salesByCarType;
  };

  checkCompany = async (companyId: number) => {
    try {
      const company = await dashboardRepository.getCompanybyId(companyId);
      if (!company) {
        throw serverError;
      }
    } catch (error) {
      throw databaseCheckError;
    }
  };

  checkUser = async (userId: number) => {
    const user = await dashboardRepository.getUserbyId(userId);
    if (!user) {
      throw serverError;
    }
  };
}

export default new dashboardService();

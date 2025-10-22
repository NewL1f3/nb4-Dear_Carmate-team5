import prisma from '../../lib/prisma';

class dashboardRepository {
  aggregatePrice = async (companyId: number, startDay: Date, lastDay: Date) => {
    try {
      const monthlySalesMedium: any = await prisma.contract.aggregate({
        _sum: {
          contractPrice: true,
        },
        where: {
          companyId,
          createdAt: {
            gte: startDay,
            lt: lastDay,
          },
        },
      });
      return monthlySalesMedium;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };

  getProceedingContractCount = async (companyId: number) => {
    try {
      const proceedingContractCount = await prisma.contract.count({
        where: {
          companyId,
          status: {
            in: ['carInspection', 'priceNegotiation', 'contractDraft'],
          },
        },
      });
      return proceedingContractCount;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };

  getCompletedContractCount = async (companyId: number) => {
    try {
      const completedContractsCount = await prisma.contract.count({
        where: {
          companyId,
          status: 'contractSuccessful',
        },
      });
      return completedContractsCount;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };

  getContractCountWithCarType = async (companyId: number) => {
    try {
      const cars = await prisma.car.findMany({
        where: { companyId },
        select: {
          id: true,
          model: {
            select: { type: true },
          },
          _count: {
            select: {
              contracts: { where: { status: 'contractSuccessful' } },
            },
          },
        },
      });
      return cars;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };

  getSuccesCarIds = async (companyId: number) => {
    const successfulCarIds = await prisma.contract.findMany({
      where: { status: 'contractSuccessful', companyId },
      select: { carId: true },
    });
    return successfulCarIds;
  };

  getPriceByModelId = async (companyId: number, carIds: number[]) => {
    try {
      const carPriceByModelId = await prisma.car.groupBy({
        by: ['modelId'],
        _sum: {
          price: true,
        },
        where: { companyId, id: { in: carIds } },
      });
      return carPriceByModelId;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };

  findModelName = async (item: any) => {
    try {
      const findedmodel = await prisma.model.findUnique({
        where: { id: item.modelId },
        select: { type: true },
      });
      return findedmodel;
    } catch (error) {
      console.error(error);
      throw new Error('데이터베이스 에러');
    }
  };
}

export default new dashboardRepository();

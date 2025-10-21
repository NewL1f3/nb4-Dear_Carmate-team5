import prisma from '../../lib/prisma';

class dashboardRepository {
  aggregatePrice = async (companyId: number, startDay: Date, lastDay: Date) => {
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
  };

  getProceedingContractCount = async (companyId: number) => {
    const proceedingContractCount = await prisma.contract.count({
      where: {
        companyId,
        status: {
          in: ['carInspection', 'priceNegotiation', 'contractDraft'],
        },
      },
    });
    return proceedingContractCount;
  };

  getCompletedContractCount = async (companyId: number) => {
    const completedContractsCount = await prisma.contract.count({
      where: {
        companyId,
        status: 'contractSuccessful',
      },
    });
    return completedContractsCount;
  };

  getContractCountWithCarType = async (companyId: number) => {
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
    return cars;
  };

  getPriceByModelId = async (companyId: number) => {
    const carPriceByModelId = await prisma.car.groupBy({
      by: ['modelId'],
      _sum: {
        price: true,
      },
      where: { companyId },
    });
    return carPriceByModelId;
  };

  findModelName = async (item: any) => {
    const findedmodel = await prisma.model.findUnique({
      where: { id: item.modelId },
      select: { type: true },
    });
    return findedmodel;
  };
}

export default new dashboardRepository();

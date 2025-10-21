// src/modules/cars/cars-repository.ts
import { PrismaClient, Prisma, CarStatusEnum } from '@prisma/client';

const prisma = new PrismaClient();

export type CarListParams = {
  page?: number;
  pageSize?: number;
  status?: CarStatusEnum;
  searchBy?: 'carNumber' | 'model';
  keyword?: string;
  companyId: number;
};

export class CarRepository {
  findMany = async (params: CarListParams) => {
    const { page = 1, pageSize = 10, status, searchBy, keyword, companyId } = params;

    const skip = (page - 1) * pageSize;
    const where: Prisma.CarWhereInput = { companyId };

    if (status) {
      where.status = status;
    }

    if (keyword && searchBy) {
      if (searchBy === 'carNumber') {
        where.carNumber = { contains: keyword, mode: 'insensitive' };
      } else if (searchBy === 'model') {
        where.model = {
          modelName: { contains: keyword, mode: 'insensitive' },
        };
      }
    }

    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          model: {
            include: {
              manufacturer: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.car.count({ where }),
    ]);

    const formattedCars = cars.map((car) => ({
      id: car.id,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer.name,
      model: car.model.modelName,
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation || '',
      accidentDetails: car.accidentDetails || '',
      status: car.status,
      type: car.model.type,
    }));

    return {
      data: formattedCars,
      totalItemCount: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  };

  findById = async (id: number) => {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            manufacturer: true,
          },
        },
      },
    });

    if (!car) return null;

    return {
      id: car.id,
      companyId: car.companyId,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer.name,
      model: car.model.modelName,
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation || '',
      accidentDetails: car.accidentDetails || '',
      status: car.status,
      type: car.model.type,
    };
  };

  create = async (data: Prisma.CarCreateInput) => {
    const car = await prisma.car.create({
      data,
      include: {
        model: {
          include: {
            manufacturer: true,
          },
        },
      },
    });

    return {
      id: car.id,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer.name,
      model: car.model.modelName,
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation || '',
      accidentDetails: car.accidentDetails || '',
      status: car.status,
      type: car.model.type,
    };
  };

  update = async (id: number, data: Prisma.CarUpdateInput) => {
    const car = await prisma.car.update({
      where: { id },
      data,
      include: {
        model: {
          include: {
            manufacturer: true,
          },
        },
      },
    });

    return {
      id: car.id,
      carNumber: car.carNumber,
      manufacturer: car.model.manufacturer.name,
      model: car.model.modelName,
      manufacturingYear: car.manufacturingYear,
      mileage: car.mileage,
      price: car.price,
      accidentCount: car.accidentCount,
      explanation: car.explanation || '',
      accidentDetails: car.accidentDetails || '',
      status: car.status,
      type: car.model.type,
    };
  };

  delete = async (id: number) => {
    return await prisma.car.delete({ where: { id } });
  };

  findAllModels = async () => {
    return await prisma.model.findMany({
      include: {
        manufacturer: true,
      },
    });
  };

  findModelByManufacturerAndName = async (
    manufacturerName: string,
    modelName: string,
    tx?: Prisma.TransactionClient,
  ) => {
    const client = tx || prisma;
    return await client.model.findFirst({
      where: {
        manufacturer: {
          name: manufacturerName,
        },
        modelName: modelName,
      },
      include: {
        manufacturer: true,
      },
    });
  };

  bulkCreate = async (
    carsData: Array<{
      modelId: number;
      companyId: number;
      carNumber: string;
      manufacturingYear: number;
      mileage: number;
      price: number;
      accidentCount?: number;
      explanation?: string | null;
      accidentDetails?: string | null;
    }>,
    tx?: Prisma.TransactionClient,
  ) => {
    const client = tx || prisma;
    return await client.car.createMany({
      data: carsData,
    });
  };

  findByCarNumber = async (companyId: number, carNumber: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.car.findUnique({
      where: {
        companyId_carNumber: {
          companyId,
          carNumber,
        },
      },
    });
  };
}

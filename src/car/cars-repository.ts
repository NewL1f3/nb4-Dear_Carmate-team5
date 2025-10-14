// src/car/cars-repository.ts
import { PrismaClient, Car, CarStatusEnum, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CarListParams {
    page?: number;
    pageSize?: number;
    status?: CarStatusEnum;
    searchBy?: 'carNumber' | 'model';
    keyword?: string;
    companyId: number;
}

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
                where.carNumber = { contains: keyword };
            } else if (searchBy === 'model') {
                where.model = {
                    modelName: { contains: keyword },
                };
            }
        }

        const [cars, totalCount] = await Promise.all([
            prisma.car.findMany({
                where,
                include: {
                    model: {
                        include: {
                            manufacturer: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: pageSize,
            }),
            prisma.car.count({ where }),
        ]);

        return {
            data: cars,
            totalItemCount: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    };

    findById = async (id: number) => {
        return prisma.car.findUnique({
            where: { id },
            include: {
                model: {
                    include: {
                        manufacturer: true,
                    },
                },
            },
        });
    };

    create = async (carData: {
        modelId: number;
        companyId: number;
        carNumber: string;
        manufacturingYear: number;
        mileage: number;
        price: number;
        accidentCount?: number;
        explanation?: string;
        accidentDetails?: string;
    }) => {
        return prisma.car.create({
            data: carData,
            include: {
                model: {
                    include: {
                        manufacturer: true,
                    },
                },
            },
        });
    };

    update = async (id: number, carData: Prisma.CarUpdateInput) => {
        return prisma.car.update({
            where: { id },
            data: carData,
            include: {
                model: {
                    include: {
                        manufacturer: true,
                    },
                },
            },
        });
    };

    delete = async (id: number) => {
        return prisma.car.delete({
            where: { id },
        });
    };

    findAllModels = async () => {
        return prisma.model.findMany({
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
        }>
    ) => {
        return prisma.car.createMany({ data: carsData });
    };

    findModelByManufacturerAndName = async (manufacturerName: string, modelName: string) => {
        return prisma.model.findFirst({
            where: {
                modelName: modelName,
                manufacturer: {
                    name: manufacturerName,
                },
            },
            include: {
                manufacturer: true,
            },
        });
    };
}
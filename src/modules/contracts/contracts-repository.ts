import prisma from '../../lib/prisma';
import type { Prisma, CarStatusEnum } from '@prisma/client';

export const contractRepository = {
  findCarByIdWithStatus: (id: number, status: CarStatusEnum) => prisma.car.findFirst({ where: { id, status }, include: { model: true } }),

  findCustomerById: (id: number) => prisma.customer.findUnique({ where: { id } }),

  createContract: (data: Prisma.ContractCreateInput) =>
    prisma.contract.create({
      data,
      include: {
        user: true,
        customer: true,
        car: { include: { model: true } },
        meetings: true,
      },
    }),

  findContracts: (companyId: number, search?: string) => {
    return prisma.contract.findMany({
      where: {
        companyId,
        ...(search
          ? {
              OR: [
                {
                  customer: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  user: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: true,
        customer: true,
        car: { include: { model: true } },
        meetings: true,
      },
      orderBy: { id: 'desc' },
    });
  },

  findContractById: (id: number) =>
    prisma.contract.findUnique({
      where: { id },
      include: {
        meetings: true,
        contractDocuments: true,
        car: { include: { model: true } },
        user: true,
        customer: true,
      },
    }),

  updateContract: (id: number, data: Prisma.ContractUpdateInput) =>
    prisma.contract.update({
      where: { id },
      data,
      include: {
        meetings: true,
        contractDocuments: true,
        car: { include: { model: true } },
        user: true,
        customer: true,
      },
    }),

  findCarsByCompany: (companyId: number, status: CarStatusEnum) =>
    prisma.car.findMany({
      where: { companyId, status },
      select: { id: true, carNumber: true, model: { select: { modelName: true } } },
    }),

  findCustomersByCompany: (companyId: number) =>
    prisma.customer.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true },
    }),

  findUsersByCompany: (companyId: number) =>
    prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true },
    }),

  updateCarStatus: (carId: number, status: CarStatusEnum) =>
    prisma.car.update({
      where: { id: carId },
      data: { status },
    }),
};
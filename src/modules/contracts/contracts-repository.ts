import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";

export const contractRepository = {
  findCarById: (id: number) =>
    prisma.car.findUnique({ where: { id }, include: { model: true } }),

  findCustomerById: (id: number) =>
    prisma.customer.findUnique({ where: { id } }),

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
                      mode: "insensitive",
                    },
                  },
                },
                {
                  user: {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
      orderBy: { id: "desc" },
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

  deleteContract: (id: number) => prisma.contract.delete({ where: { id } }),

  findCarsByCompany: (companyId: number) =>
    prisma.car.findMany({
      where: { companyId },
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
};

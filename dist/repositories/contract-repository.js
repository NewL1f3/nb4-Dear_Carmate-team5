"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
exports.contractRepository = {
    findCarById: (id) => prisma_1.default.car.findUnique({ where: { id }, include: { model: true } }),
    findCustomerById: (id) => prisma_1.default.customer.findUnique({ where: { id } }),
    createContract: (data) => prisma_1.default.contract.create({
        data,
        include: {
            user: true,
            customer: true,
            car: { include: { model: true } },
            meetings: true,
        },
    }),
    findContracts: (companyId, search) => {
        return prisma_1.default.contract.findMany({
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
    findContractById: (id) => prisma_1.default.contract.findUnique({
        where: { id },
        include: {
            meetings: true,
            contractDocuments: true,
            car: { include: { model: true } },
            user: true,
            customer: true,
        },
    }),
    updateContract: (id, data) => prisma_1.default.contract.update({
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
    deleteContract: (id) => prisma_1.default.contract.delete({ where: { id } }),
    findCarsByCompany: (companyId) => prisma_1.default.car.findMany({
        where: { companyId },
        select: { id: true, carNumber: true, model: { select: { modelName: true } } },
    }),
    findCustomersByCompany: (companyId) => prisma_1.default.customer.findMany({
        where: { companyId },
        select: { id: true, name: true, email: true },
    }),
    findUsersByCompany: (companyId) => prisma_1.default.user.findMany({
        where: { companyId },
        select: { id: true, name: true, email: true },
    }),
};
//# sourceMappingURL=contract-repository.js.map
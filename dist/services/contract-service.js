"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractService = void 0;
const zod_1 = require("zod");
const contract_repository_1 = require("../repositories/contract-repository");
const client_1 = require("@prisma/client");
const createContractSchema = zod_1.z.object({
    carId: zod_1.z.number().int().positive(),
    customerId: zod_1.z.number().int().positive(),
    date: zod_1.z.coerce.date(),
    alarms: zod_1.z.array(zod_1.z.string()).nonempty('알람은 최소 1개 이상이어야 합니다.'),
});
const updateContractSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ContractStatusEnum).optional(),
    resolutionDate: zod_1.z.date().nullable().optional(),
    contractPrice: zod_1.z.number().int().nonnegative().optional(),
    userId: zod_1.z.number().int().optional(),
    customerId: zod_1.z.number().int().optional(),
    carId: zod_1.z.number().int().optional(),
    meeting: zod_1.z
        .array(zod_1.z.object({
        date: zod_1.z.coerce.date(),
        alarms: zod_1.z.array(zod_1.z.string()),
    }))
        .optional(),
    contractDocuments: zod_1.z
        .array(zod_1.z.object({
        fileName: zod_1.z.string().min(1),
        fileUrl: zod_1.z.string().url(),
    }))
        .optional(),
});
exports.contractService = {
    async createContract(user, body) {
        const parsed = createContractSchema.safeParse(body);
        if (!parsed.success) {
            throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
        }
        const { carId, customerId, date, alarms } = parsed.data;
        const car = await contract_repository_1.contractRepository.findCarById(carId);
        if (!car)
            throw new Error('Car not found');
        const customer = await contract_repository_1.contractRepository.findCustomerById(customerId);
        if (!customer)
            throw new Error('Customer not found');
        const contract = await contract_repository_1.contractRepository.createContract({
            user: { connect: { id: user.id } },
            customer: { connect: { id: customerId } },
            car: { connect: { id: carId } },
            company: { connect: { id: user.companyId } },
            contractPrice: car.price,
            contractName: `${car.model.modelName} - ${customer.name} 고객님`,
            status: 'carInspection',
            meetings: {
                create: { date, alarms },
            },
        });
        return {
            id: contract.id,
            status: contract.status,
            resolutionDate: contract.resolutionDate,
            contractPrice: contract.contractPrice,
            meeting: contract.meetings.map((m) => ({ date: m.date, alarms: m.alarms })),
            user: { id: contract.user.id, name: contract.user.name },
            customer: { id: contract.customer.id, name: contract.customer.name },
            car: { id: contract.car.id, model: contract.car.model.modelName },
        };
    },
    async getContracts(companyId, search) {
        const contracts = await contract_repository_1.contractRepository.findContracts(companyId, search);
        return contracts.reduce((acc, c) => {
            if (!acc[c.status])
                acc[c.status] = { totalItemCount: 0, data: [] };
            acc[c.status].totalItemCount++;
            acc[c.status].data.push({
                id: c.id,
                car: { id: c.car.id, model: c.car.model.modelName },
                customer: { id: c.customer.id, name: c.customer.name },
                user: { id: c.user.id, name: c.user.name },
                meeting: c.meetings.map((m) => ({ date: m.date, alarms: m.alarms })),
                contractPrice: c.contractPrice,
                resolutionDate: c.resolutionDate,
                status: c.status,
            });
            return acc;
        }, {});
    },
    async updateContract(contractId, data) {
        const parsed = updateContractSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
        }
        const validated = parsed.data;
        const existing = await contract_repository_1.contractRepository.findContractById(contractId);
        if (!existing)
            throw new Error('Contract not found');
        if (validated.contractDocuments && validated.status !== 'contractSuccessful') {
            throw new Error('Cannot upload documents before contract is successful');
        }
        const updateData = {
            status: validated.status,
            resolutionDate: validated.resolutionDate ?? null,
            contractPrice: validated.contractPrice ?? null,
            user: validated.userId ? { connect: { id: validated.userId } } : undefined,
            customer: validated.customerId ? { connect: { id: validated.customerId } } : undefined,
            car: validated.carId ? { connect: { id: validated.carId } } : undefined,
            meetings: validated.meeting
                ? {
                    deleteMany: { contractId },
                    create: validated.meeting.map((m) => ({ date: m.date, alarms: m.alarms })),
                }
                : undefined,
            contractDocuments: validated.contractDocuments
                ? {
                    deleteMany: { contractId },
                    create: validated.contractDocuments.map((doc) => ({
                        contractId,
                        fileName: doc.fileName,
                        fileUrl: doc.fileUrl,
                    })),
                }
                : undefined,
        };
        const updated = await contract_repository_1.contractRepository.updateContract(contractId, updateData);
        return {
            id: updated.id,
            status: updated.status,
            resolutionDate: updated.resolutionDate,
            contractPrice: updated.contractPrice,
            meeting: updated.meetings.map((m) => ({ date: m.date, alarms: m.alarms })),
            user: { id: updated.user.id, name: updated.user.name },
            customer: { id: updated.customer.id, name: updated.customer.name },
            car: { id: updated.car.id, model: updated.car.model.modelName },
        };
    },
    async deleteContract(id) {
        await contract_repository_1.contractRepository.deleteContract(id);
    },
    async getCarInfo(companyId) {
        const cars = await contract_repository_1.contractRepository.findCarsByCompany(companyId);
        return cars.map((car) => ({
            id: car.id,
            data: `${car.model.modelName} (${car.carNumber})`,
        }));
    },
    async getCustomerInfo(companyId) {
        const customers = await contract_repository_1.contractRepository.findCustomersByCompany(companyId);
        return customers.map((c) => ({
            id: c.id,
            data: `${c.name} (${c.email})`,
        }));
    },
    async getUserInfo(companyId) {
        const users = await contract_repository_1.contractRepository.findUsersByCompany(companyId);
        return users.map((u) => ({
            id: u.id,
            data: `${u.name} (${u.email})`,
        }));
    },
};
//# sourceMappingURL=contract-service.js.map
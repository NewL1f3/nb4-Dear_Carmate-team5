import { contractRepository } from '../repositories/contract-repository';
import { Contract, User, Meeting, ContractDocument, Prisma } from '@prisma/client';

export interface CreateContractBody {
  carId: number;
  customerId: number;
  date: Date;
  alarms: string[];
}

export interface UpdateContractBody {
  status?: Contract['status'];
  resolutionDate?: Date | null;
  contractPrice?: number;
  userId?: number;
  customerId?: number;
  carId?: number;
  meeting?: Pick<Meeting, 'date' | 'alarms'>[];
  contractDocuments?: Pick<ContractDocument, 'fileName' | 'fileUrl'>[];
}

export interface ContractResponse {
  id: number;
  status: Contract['status'];
  resolutionDate: Date | null;
  contractPrice: number | null;
  meeting: Pick<Meeting, 'date' | 'alarms'>[];
  user: Pick<User, 'id' | 'name'>;
  customer: Pick<User, 'id' | 'name'>;
  car: { id: number; model: string };
}

export const contractService = {
  async createContract(user: Express.User, body: CreateContractBody): Promise<ContractResponse> {
    const { carId, customerId, date, alarms } = body;

    const car = await contractRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');

    const customer = await contractRepository.findCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const contract = await contractRepository.createContract({
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

  async getContracts(companyId: number) {
    const contracts = await contractRepository.findContractsByCompany(companyId);

    return contracts.reduce<Record<string, { totalItemCount: number; data: ContractResponse[] }>>((acc, c) => {
      if (!acc[c.status]) acc[c.status] = { totalItemCount: 0, data: [] };
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

  async updateContract(contractId: number, data: UpdateContractBody): Promise<ContractResponse> {
    const existing = await contractRepository.findContractById(contractId);
    if (!existing) throw new Error('Contract not found');

    if (data.contractDocuments && data.status !== 'contractSuccessful') {
      throw new Error('Cannot upload documents before contract is successful');
    }

    const updateData: Prisma.ContractUpdateInput = {
      status: data.status,
      resolutionDate: data.resolutionDate ?? null,
      contractPrice: data.contractPrice ?? null,
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      customer: data.customerId ? { connect: { id: data.customerId } } : undefined,
      car: data.carId ? { connect: { id: data.carId } } : undefined,
      meetings: data.meeting
        ? {
            deleteMany: { contractId },
            create: data.meeting.map((m) => ({ date: m.date, alarms: m.alarms })),
          }
        : undefined,
      contractDocuments: data.contractDocuments
        ? {
            deleteMany: { contractId },
            create: data.contractDocuments.map((doc) => ({
              contractId,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
            })),
          }
        : undefined,
    };

    const updated = await contractRepository.updateContract(contractId, updateData);

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

  async deleteContract(id: number): Promise<void> {
    await contractRepository.deleteContract(id);
  },

  async getCarInfo(companyId: number) {
    const cars = await contractRepository.findCarsByCompany(companyId);
    return cars.map((car) => ({
      id: car.id,
      data: `${car.model.modelName} (${car.carNumber})`,
    }));
  },
  async getCustomerInfo(companyId: number) {
    const customers = await contractRepository.findCustomersByCompany(companyId);
    return customers.map((c) => ({
      id: c.id,
      data: `${c.name} (${c.email})`,
    }));
  },

  async getUserInfo(companyId: number) {
    const users = await contractRepository.findUsersByCompany(companyId);
    return users.map((u) => ({
      id: u.id,
      data: `${u.name} (${u.email})`,
    }));
  },
};
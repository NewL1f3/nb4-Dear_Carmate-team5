import { contractRepository } from './contracts-repository';
import { Prisma, ContractStatusEnum, Contract, Meeting, User } from '@prisma/client';
import { formatContract } from '../../utils/formatContract';
import { contractResponseSchema, ContractResponse, CreateContractDto, createContractSchema, updateContractSchema, UpdateContractDto } from './contracts-dto';

export const contractService = {
  async createContract(user: Express.User, body: CreateContractDto): Promise<ContractResponse> {
    const parsed = createContractSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
    }

    const { carId, customerId, meetings } = parsed.data;

    const car = await contractRepository.findCarById(carId);
    if (!car) throw new Error('Car not found');

    const customer = await contractRepository.findCustomerById(customerId);
    if (!customer) throw new Error('Customer not found');

    const meetingData = meetings.map((m) => ({
      date: new Date(m.date),
      alarms: m.alarms.map((a) => new Date(a)),
    }));

    const contract = await contractRepository.createContract({
      user: { connect: { id: user.id } },
      customer: { connect: { id: customerId } },
      car: { connect: { id: carId } },
      company: { connect: { id: user.companyId } },
      contractPrice: car.price,
      contractName: `${car.model.modelName} - ${customer.name} 고객님`,
      status: 'carInspection',
      meetings: { create: meetingData },
    });

    const dto = formatContract(contract);
    return contractResponseSchema.parse(dto);
  },

  async getContracts(companyId: number, search?: string) {
    const contracts = await contractRepository.findContracts(companyId, search);

    const defaultStructure: Record<string, { totalItemCount: number; data: ContractResponse[] }> = {
      carInspection: { totalItemCount: 0, data: [] },
      priceNegotiation: { totalItemCount: 0, data: [] },
      contractDraft: { totalItemCount: 0, data: [] },
      contractFailed: { totalItemCount: 0, data: [] },
      contractSuccessful: { totalItemCount: 0, data: [] },
    };

    return contracts.reduce((acc, c) => {
      if (!acc[c.status]) acc[c.status] = { totalItemCount: 0, data: [] };

      const dto = formatContract(c);
      acc[c.status].totalItemCount++;
      acc[c.status].data.push(contractResponseSchema.parse(dto));

      return acc;
    }, defaultStructure);
  },

  async updateContract(contractId: number, data: UpdateContractDto) {
    const parsed = updateContractSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
    }

    const validated = parsed.data;
    const existing = await contractRepository.findContractById(contractId);
    if (!existing) throw new Error('Contract not found');

    const updateData: Prisma.ContractUpdateInput = {
      status: validated.status,
      resolutionDate: validated.resolutionDate ? new Date(validated.resolutionDate) : null,
      contractPrice: validated.contractPrice !== undefined ? validated.contractPrice : undefined,
      user: validated.userId ? { connect: { id: validated.userId } } : undefined,
      customer: validated.customerId ? { connect: { id: validated.customerId } } : undefined,
      car: validated.carId ? { connect: { id: validated.carId } } : undefined,
      meetings: validated.meetings
        ? {
            deleteMany: { contractId },
            create: validated.meetings.map((m) => ({
              date: new Date(m.date),
              alarms: m.alarms.map((a) => new Date(a)),
            })),
          }
        : undefined,
    };

    const updated = await contractRepository.updateContract(contractId, updateData);

    const dto = formatContract(updated);
    return contractResponseSchema.parse(dto);
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

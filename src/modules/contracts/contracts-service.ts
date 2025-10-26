import { contractRepository } from './contracts-repository';
import { Prisma, CarStatusEnum } from '@prisma/client';
import { formatContract } from '../../utils/formatContract';
import {
  contractResponseSchema,
  ContractResponse,
  CreateContractDto,
  createContractSchema,
  updateContractSchema,
  UpdateContractDto,
} from './contracts-dto';
import type { LinkContractData } from './contracts-dto';
import { sendContractEmail } from '../../lib/email-service';
import { createDownloadUrl } from '../../lib/cloudinary-service';
import prisma from '../../lib/prisma';

export const contractService = {
  async createContract(user: Express.User, body: CreateContractDto): Promise<ContractResponse> {
    const parsed = createContractSchema.safeParse(body);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
    }

    const { carId, customerId, meetings } = parsed.data;

    const car = await contractRepository.findCarByIdWithStatus(carId, CarStatusEnum.possession);
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

    await contractRepository.updateCarStatus(carId, CarStatusEnum.contractProceeding);

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

  async updateContract(userId: number, contractId: number, data: UpdateContractDto) {
    const parsed = updateContractSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((e) => e.message).join(', '));
    }

    const validated = parsed.data;

    const existing = await contractRepository.findContractById(contractId);
    if (!existing) throw new Error('Contract not found');

    if (userId !== existing.userId) throw new Error('계약을 수정할 권한이 없습니다.');

    if (['contractSuccessful', 'contractFailed'].includes(existing.status)) {
      throw new Error('완료된 계약입니다.');
    }

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

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.carId) {
        if (updateData.status === 'contractSuccessful') {
          await tx.car.update({
            where: { id: existing.carId },
            data: { status: CarStatusEnum.contractCompleted },
          });

          if (existing.customerId) {
            await tx.customer.update({
              where: { id: existing.customerId },
              data: { contractCount: { increment: 1 } },
            });
          }
        } else if (updateData.status === 'contractFailed') {
          await tx.car.update({
            where: { id: existing.carId },
            data: { status: CarStatusEnum.possession },
          });
        }
      }

      return tx.contract.update({
        where: { id: contractId },
        data: updateData,
        include: {
          meetings: true,
          contractDocuments: true,
          car: { include: { model: true } },
          user: true,
          customer: true,
        },
      });
    });

    const dto = formatContract(updated);
    return contractResponseSchema.parse(dto);
  },

  async deleteContract(id: number): Promise<void> {
    const contract = await contractRepository.findContractById(id);
    if (!contract) throw new Error('Contract not found');

    await prisma.$transaction(async (tx) => {
      if (contract.carId) {
        await tx.car.update({
          where: { id: contract.carId },
          data: { status: CarStatusEnum.possession },
        });
      }

      await tx.contract.delete({
        where: { id },
      });
    });
  },

  async getCarInfo(companyId: number) {
    const cars = await contractRepository.findCarsByCompany(companyId, CarStatusEnum.possession);
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

// 계약과 게약서 관계 연결
export const linkContractService = async (id: number, userId: number, contractDocuments: LinkContractData[]) => {
  // 계약 존재 및 인가 확인
  const contractFind = await contractRepository.findContractById(id);
  if (!contractFind) throw new Error('계약을 찾을 수 없습니다.');
  if (contractFind.userId !== userId) throw new Error('계약을 수정할 권한이 없습니다.');

  // contractDocumentId 추출
  const documentIds = contractDocuments.map((document) => ({ id: document.id }));

  const updateData: Prisma.ContractUpdateInput = {
    contractDocuments: {
      set: documentIds,
    },
    documentCount: documentIds.length,
  };

  const contract = await contractRepository.updateContract(id, updateData);

  // 고객의 이메일이 있을때 계약서 첨부 후 메일 발송
  if (contract.customer.email) {
    const documents = contract.contractDocuments;
    const toName = contract.customer.name;
    const toEmail = contract.customer.email;

    // 이메일 첨부를 위한 AttachmentInfo 배열
    const attachmentsData: { fileName: string; fileUrl: string; contentType: string }[] = [];

    for (const document of documents) {
      // Cloudinary URL 생성
      const downloadUrl = createDownloadUrl(document.publicId);
      attachmentsData.push({
        fileName: document.fileName,
        fileUrl: downloadUrl,
        contentType: 'application/pdf',
      });
    }

    // 고객 메일로 계약서 첨부 이메일 발송
    await sendContractEmail(toName, toEmail, attachmentsData);
  }

  // 데이터 가공
  const contractData = {
    id: contract.id,
    status: contract.status,
    resolutionDate: contract.resolutionDate,
    contractPrice: contract.contractPrice,
    meetings: contract.meetings,
    user: {
      id: contract.user.id,
      name: contract.user.name,
    },
    customer: {
      id: contract.customer.id,
      name: contract.customer.name,
    },
    car: {
      id: contract.car.id,
      model: contract.car.model.modelName,
    },
  };

  return contractData;
};

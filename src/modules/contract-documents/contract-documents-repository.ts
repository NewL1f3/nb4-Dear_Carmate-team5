import prisma from '../../lib/prisma.js';
import type { Prisma } from '@prisma/client';

// 계약서 업로드 시 계약 목록 조회
export const getContractDocuments = async (contractDocumentsQuery: Prisma.ContractFindManyArgs) => {
  const contract = await prisma.contract.findMany({
    ...contractDocumentsQuery,
    select: {
      id: true,
      contractName: true,
      resolutionDate: true,
      documentCount: true,
      user: {
        select: {
          name: true,
        },
      },
      car: {
        select: {
          carNumber: true,
        },
      },
      contractDocuments: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  });

  return contract;
};

// 계약서 추가 시 계약 목록 조회
export const getContracts = async (contractsQuery: Prisma.ContractFindManyArgs) => {
  const contract = await prisma.contract.findMany({
    ...contractsQuery,
    select: {
      id: true,
      contractName: true,
    },
  });

  return contract;
};

// 계약서 업로드
export const uploadContractDocument = async (createDate: Prisma.ContractDocumentCreateInput) => {
  const contractDocument = await prisma.contractDocument.create({
    data: createDate,
    select: {
      id: true,
    },
  });

  return contractDocument;
};

// 계약서 존재 확인
export const findContractDocument = async (id: number) => {
  const contractDocument = await prisma.contractDocument.findUnique({
    where: { id },
    select: {
      fileName: true,
      publicId: true,
      contract: {
        select: {
          company: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return contractDocument;
};

// 인가자(현재 사용자) 회사 확인
export const findCompany = async (userId: number) => {
  const company = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      company: {
        select: {
          id: true,
        },
      },
    },
  });

  return company;
};

// 계약 총 count 확인
export const countContracts = async (where: Prisma.ContractWhereInput) => {
  const totalItemCount = await prisma.contract.count({
    where,
  });

  return totalItemCount;
};

import prisma from '../../lib/prisma.js';
import type { Prisma } from '@prisma/client';

// 계약서 업로드 시 계약 목록 조회

// 게약서 추가 시 계약 목록 조회
export const getContracts = async (contracsQuery: Prisma.ContractFindManyArgs) => {
  const contracs = await prisma.contract.findMany({
    ...contracsQuery,
    select: {
      id: true,
      contractName: true,
    },
  });

  return contracs;
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
      fileUrl: true,
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

// 회사 확인
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

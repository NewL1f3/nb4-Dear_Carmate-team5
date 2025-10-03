import * as contractDocumentRepository from './contractDocuments-repository.js';
import type { UploadContractDocumentData } from './contractDocuments-dto.js';
import type { Prisma } from '@prisma/client';

// 계약서 업로드 시 계약 목록 조회

// 게약서 추가 시 계약 목록 조회
export const getContracts = async (userId: number) => {
  // 인가자(현재 사용자) 회사 확인
  const company = await contractDocumentRepository.findCompany(userId);
  if (!company) throw new Error('사용자 회사를 찾을 수 없습니다.');

  const companyId = company.company.id;
  const where: Prisma.ContractWhereInput = {
    status: 'contractSuccessful',
    companyId,
  };

  const contracsQuery: Prisma.ContractFindManyArgs = { where };

  const contracs = await contractDocumentRepository.getContracts(contracsQuery);

  return contracs;
};

// 계약서 업로드
export const uploadContractDocument = async (data: UploadContractDocumentData) => {
  const { fileName, fileUrl } = data;

  const createData: Prisma.ContractDocumentCreateInput = {
    fileName,
    fileUrl,
  };

  const contractDocument = await contractDocumentRepository.uploadContractDocument(createData);

  return contractDocument;
};

// 계약서 다운로드
export const downloadContractDocument = async (id: number, userId: number) => {
  // 계약서 존재 확인
  const contractDocument = await contractDocumentRepository.findContractDocument(id);
  if (!contractDocument) throw new Error('계약서를 찾을 수 없습니다.');

  // 인가자(현재 사용자) 회사 확인
  const company = await contractDocumentRepository.findCompany(userId);
  if (!company) throw new Error('사용자 회사를 찾을 수 없습니다.');

  // 계약과 계약서의 연결 확인 (타입 가드)
  if (!contractDocument.contract) {
    throw new Error('사용자 인가를 확인할 수 없습니다: 연결된 계약 정보가 없습니다.');
  }

  // 인가 확인
  if (company.company.id !== contractDocument.contract.company.id) {
    throw new Error('인가 실패');
  }

  return contractDocument;
};

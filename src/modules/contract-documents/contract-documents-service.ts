import * as contractDocumentRepository from './contract-documents-repository.js';
import type { GetContractDocumentsQuery, UploadContractDocumentData } from './contract-documents-dto.js';
import type { Prisma } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// 계약서 업로드 시 계약 목록 조회
export const getContractDocuments = async (query: GetContractDocumentsQuery = {}, userId: number) => {
  const { page = 1, pageSize = 8, searchBy, keyword } = query;
  // 페이지 네이션 offset 방식
  const take = pageSize;
  const skip = (page - 1) * take;

  // 인가자(현재 사용자) 회사 확인
  const company = await contractDocumentRepository.findCompany(userId);
  if (!company) throw new Error('사용자 회사를 찾을 수 없습니다.');

  const companyId = company.company.id;

  // 검색 기능 추가
  let search: Prisma.ContractWhereInput = {};
  if (keyword && searchBy) {
    switch (searchBy) {
      case 'contractName':
        search = { contractName: { contains: keyword, mode: 'insensitive' } };
        break;
      case 'carNumber':
        search = {
          car: {
            is: {
              carNumber: { contains: keyword, mode: 'insensitive' },
            },
          },
        };
        break;
      case 'userName':
        search = {
          user: {
            is: {
              name: { contains: keyword, mode: 'insensitive' },
            },
          },
        };
        break;
    }
  }

  // where 조건 추가
  const where: Prisma.ContractWhereInput = {
    status: 'contractSuccessful',
    companyId,
    ...search,
    // 조건: 계약서가 1개 이상
    contractDocuments: { some: {} },
  };

  // query 구성 (페이지 네이션, 정렬 포함)
  const contractDocumentsQuery: Prisma.ContractFindManyArgs = {
    where,
    take,
    skip,
    orderBy: {
      createdAt: 'asc',
    },
  };

  // 계약 총 count 확인
  const totalItemCount = await contractDocumentRepository.countContracts(where);
  const totalPages = Math.ceil(totalItemCount / take);

  const contractDocument = await contractDocumentRepository.getContractDocuments(contractDocumentsQuery);

  // 데이터 가공
  const data = contractDocument.map((contract) => ({
    id: contract.id,
    contractName: contract.contractName,
    resolutionDate: contract.resolutionDate,
    documentsCount: contract.documentsCount,
    manager: contract.user.name,
    carNumber: contract.car.carNumber,
    documents: contract.contractDocuments,
  }));

  const contractDocumentData = {
    currentPage: page,
    totalPages,
    totalItemCount,
    data,
  };

  return contractDocumentData;
};

// 계약서 추가 시 계약 목록 조회
export const getContracts = async (userId: number) => {
  // 인가자(현재 사용자) 회사 확인
  const company = await contractDocumentRepository.findCompany(userId);
  if (!company) throw new Error('사용자 회사를 찾을 수 없습니다.');

  const companyId = company.company.id;

  // where 조건 추가
  const where: Prisma.ContractWhereInput = {
    status: 'contractSuccessful',
    companyId,
    // 조건: 계약서가 0개
    contractDocuments: { none: {} },
  };

  // query 구성 (정렬 포함)
  const contractsQuery: Prisma.ContractFindManyArgs = {
    where,
    orderBy: {
      createdAt: 'asc',
    },
  };

  const contract = await contractDocumentRepository.getContracts(contractsQuery);

  // 데이터 가공
  const contractDocumentData = contract.map((contract) => ({
    id: contract.id,
    data: contract.contractName,
  }));

  return contractDocumentData;
};

// 계약서 업로드
export const uploadContractDocument = async (data: UploadContractDocumentData) => {
  const { publicId, fileName, fileUrl } = data;

  const createData: Prisma.ContractDocumentCreateInput = {
    publicId,
    fileName,
    fileUrl,
  };

  const contractDocument = await contractDocumentRepository.uploadContractDocument(createData);

  // 데이터 가공
  const contractDocumentData = {
    contractDocumentId: contractDocument.id,
  };

  return contractDocumentData;
};

// 계약서 다운로드
export const downloadContractDocument = async (id: number, userId: number) => {
  // 계약서 존재 확인
  const contractDocument = await contractDocumentRepository.findContractDocument(id);
  if (!contractDocument) throw new Error('계약서를 찾을 수 없습니다.');

  // 인가자(현재 사용자) 회사 확인
  const company = await contractDocumentRepository.findCompany(userId);
  if (!company) throw new Error('사용자 회사를 찾을 수 없습니다.');

  // // 계약과 계약서의 연결 확인 (타입 가드)
  // if (!contractDocument.contract) {
  //   throw new Error('사용자 인가를 확인할 수 없습니다: 연결된 계약 정보가 없습니다.');
  // }

  // // 인가 확인
  // if (company.company.id !== contractDocument.contract.company.id) {
  //   throw new Error('인가 실패');
  // }

  // Cloudinary ID 존재 확인
  if (!contractDocument.publicId) {
    throw new Error('publicId를 찾을 수 없습니다.');
  }

  const { publicId, fileName } = contractDocument;

  // Cloudinary 키 만료 시간 30분
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 30;
  // Cloudinary URL 생성
  const downloadUrl = cloudinary.url(publicId, {
    resource_type: 'raw',
    folder: 'contractdocuments',
    type: 'authenticated',
    flags: 'attachment',
    sign_url: true,
    expires_at: expiresAt,
    secure: true,
  });

  // 데이터
  const contractDocumentData = {
    fileName,
    downloadUrl,
  };

  return contractDocumentData;
};

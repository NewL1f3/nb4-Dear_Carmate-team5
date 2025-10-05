import * as contractDocumentService from './contract-documents-service.js';
import type { Request, Response } from 'express';
import type { DownloadContractDocumentRequest, GetContractDocumentsRequest } from './contract-documents-dto.js';

// 계약서 업로드 시 계약 목록 조회
export const getContractDocuments = async (req: GetContractDocumentsRequest, res: Response) => {
  const query = req.parsedQuery;

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contractDocuments = await contractDocumentService.getContractDocuments(query, userId);
  return res.status(200).json({ ...contractDocuments });
};

// 계약서 추가 시 계약 목록 조회
export const getContracts = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contracs = await contractDocumentService.getContracts(userId);
  return res.status(200).json({ ...contracs });
};

// 계약서 업로드
export const uploadContractDocument = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('계약서 파일이 필요합니다.');
  }
  const fileName = req.file.originalname;
  const fileUrl = req.file.path;

  const data = { fileName, fileUrl };
  const contractDocument = await contractDocumentService.uploadContractDocument(data);
  return res.status(201).json({ ...contractDocument });
};

// 계약서 다운로드
export const downloadContractDocument = async (req: DownloadContractDocumentRequest, res: Response) => {
  const { id } = req.parsedParams;
  if (!id) throw new Error('계약서 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contractDocument = await contractDocumentService.downloadContractDocument(id, userId);
  return res.download(contractDocument.fileUrl, contractDocument.fileName);
};

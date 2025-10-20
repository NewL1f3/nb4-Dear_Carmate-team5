import * as contractDocumentService from './contract-documents-service';
import type { Request, Response } from 'express';
import type {
  GetContractDocumentsRequest,
  UploadContractDocumentRequest,
  DownloadContractDocumentRequest,
} from './contract-documents-dto';
import axios from 'axios';
import { deleteFileFromCloudinary } from '../../lib/cloudinary-service';

// 계약서 업로드 시 계약 목록 조회
export const getContractDocuments = async (req: GetContractDocumentsRequest, res: Response) => {
  const query = req.parsedQuery;

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contractDocumentData = await contractDocumentService.getContractDocuments(query, userId);
  return res.status(200).json(contractDocumentData);
};

// 계약서 추가 시 계약 목록 조회
export const getContracts = async (req: Request, res: Response) => {
  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contractDocumentData = await contractDocumentService.getContracts(userId);
  return res.status(200).json(contractDocumentData);
};

// 계약서 업로드
export const uploadContractDocument = async (req: UploadContractDocumentRequest, res: Response) => {
  if (!req.cloudinaryResult) {
    throw new Error('파일 업로드 정보가 필요합니다.');
  }

  const publicId = req.cloudinaryResult.public_id;
  const fileName = req.cloudinaryResult.originalName;
  const fileUrl = req.cloudinaryResult.secure_url;

  const data = { publicId, fileName, fileUrl };

  try {
    const contractDocumentData = await contractDocumentService.uploadContractDocument(data);
    return res.status(201).json(contractDocumentData);

    // DB 저장 실패 시 롤백 (Cloudinary 파일 삭제)
  } catch (dbError) {
    console.error('DB 저장 실패! Cloudinary 롤백을 시작합니다.', dbError);
    await deleteFileFromCloudinary(publicId);

    return res.status(500).json({ message: '파일 정보를 저장하는 데 실패했습니다.' });
  }
};

// 계약서 다운로드
export const downloadContractDocument = async (req: DownloadContractDocumentRequest, res: Response) => {
  const { id } = req.parsedParams;
  if (!id) throw new Error('계약서 ID가 필요합니다.');

  if (!req.user) throw new Error('사용자 인증이 필요합니다.');
  const userId = req.user.id;

  const contractDocumentData = await contractDocumentService.downloadContractDocument(id, userId);
  const { fileName, downloadUrl } = contractDocumentData;

  // Cloudinary 응답 받고 파일명 가공 후 클라이언트에게 전달
  try {
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
    });

    // 다운로드 파일명 가공
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    return response.data.pipe(res);
  } catch (urlError) {
    console.error('Cloudinary URL 생성 오류:', urlError);
    return res.status(500).json({ message: '다운로드 링크를 생성하는 데 실패했습니다.' });
  }
};

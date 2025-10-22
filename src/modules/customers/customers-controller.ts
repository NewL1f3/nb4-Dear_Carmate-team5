import prisma from '../../lib/prisma';

import { unauthorizedError, serverError, databaseCheckError, noCustomerError, badRequestError } from '../../lib/errors';

import { Request, Response, NextFunction } from 'express';
import Busboy from 'busboy';
import csv from 'csv-parser';
import { Readable } from 'stream';

import customerService from './customers-service';

import { CustomerSearchParams } from './customers-dto';
import companyController from '../company/company-controller';

export class customerController {
  postCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 실제 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });
    if (!user) {
      throw unauthorizedError;
    }

    const companyId = user.companyId;

    let data = req.body;
    let newCustomer = customerService.postCustomer({ companyId, data });

    return res.status(201).send(newCustomer);
  };

  getManyCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 정석 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    if (!user) {
      throw unauthorizedError;
    }

    const companyId = +user.companyId;

    let { page = '1', pageSize = '8', searchBy = 'name', keyword = '' } = req.query as unknown as CustomerSearchParams;

    const returnData = await customerService.getManyCustomer({ page, pageSize, searchBy, keyword, companyId });

    return res.status(200).send(returnData);
  };

  patchCustomer = async function (req: Request, res: Response, next: NextFunction) {
    // 정석 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    //user가 없을 시 에러 발생
    if (!user) {
      throw unauthorizedError;
    }

    const companyId = user.companyId;
    let customerId = +req.params.customerId;
    let data = req.body;

    if (typeof customerId !== 'number') {
      throw badRequestError;
    }

    const userId = +user.id;
    const response = await customerService.patchCustomer({ data, customerId, companyId, userId });
    return res.status(200).send(response);
  };

  deleteCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const customerId = +req.params.customerId;
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }

    // 원래 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });
    if (!user) {
      throw unauthorizedError;
    }
    const userId = +user.id;

    await customerService.deleteCustomer(customerId, userId);

    return res.status(204).send({ message: `고객 삭제 성공` });
  };

  getOneCustomer = async function (req: Request, res: Response, next: NextFunction) {
    const customerId = +req.params.customerId;
    //customerId 유효성 검사
    if (typeof customerId !== 'number') {
      throw badRequestError;
    }
    // 원래 코드
    // const user = req.user;

    // 테스트용 유저 코드
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    if (!user) {
      throw unauthorizedError;
    }
    const userId = +user.id;

    const response = await customerService.getOneCustomer(customerId, userId);
    return res.status(200).send(response);
  };

  uploadCustomers = async function (req: Request, res: Response, next: NextFunction) {
    // const user = req.user;
    const user = await prisma.user.findUnique({
      where: { id: 1 },
    });

    if (!user) {
      throw unauthorizedError;
    }

    const companyId = user.companyId;
    const busboy = Busboy({ headers: req.headers });
    let rows: any[] = [];

    busboy.on('file', (fieldname: string, file: Readable, filename: string, encoding: string, mimetype: string) => {
      // if (mimetype !== 'text/csv') {
      //   return res.status(400).json({ error: 'CSV 파일만 업로드할 수 있습니다.' });
      // }

      file
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          try {
            const result = await customerService.uploadCustomers(rows, companyId);
            return res.status(200).json(result);
          } catch (err) {
            console.error(err);
            return res.status(500).json({ error: '데이터 업로드 중 오류 발생' });
          }
        });
    });

    req.pipe(busboy);
  };
}

export default new customerController();

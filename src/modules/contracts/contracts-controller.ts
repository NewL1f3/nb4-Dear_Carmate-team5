import type { Request, Response } from 'express';
import { contractService, linkContractService } from './contracts-service';
import { patchContractSchema } from './contracts-dto';

export const contractController = {
  async create(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const contract = await contractService.createContract(req.user, req.body);
      res.status(201).json(contract);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async get(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const { search } = req.query;
      const contracts = await contractService.getContracts(req.user.companyId, search as string);
      res.status(200).json(contracts);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async update(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.user.id;

    const contractId = Number(req.params.id);
    try {
      // 분기 지점: req.body 안에 contractDocuments 값이 있을 경우
      if (req.body?.contractDocuments?.length) {
        // 유효성 검사, 나중에 라우터로 위치 옮기면 좋음
        const parsed = patchContractSchema.parse(req.body);
        const { contractDocuments } = parsed;

        // 계약과 게약서 관계 연결
        const contractData = await linkContractService(contractId, userId, contractDocuments);
        return res.status(200).json(contractData);
      }

      const updatedContract = await contractService.updateContract(contractId, req.body);
      res.status(200).json(updatedContract);
    } catch (err: any) {
      console.error(err);
      res.status(400).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async delete(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const contractId = Number(req.params.id);
    try {
      await contractService.deleteContract(contractId);
      res.status(200).end();
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async getCarInfo(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const cars = await contractService.getCarInfo(req.user.companyId);
      res.status(200).json(cars);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async getCustomerInfo(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const customers = await contractService.getCustomerInfo(req.user.companyId);
      res.status(200).json(customers);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  },

  async getUserInfo(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const users = await contractService.getUserInfo(req.user.companyId);
      res.status(200).json(users);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
  },
};

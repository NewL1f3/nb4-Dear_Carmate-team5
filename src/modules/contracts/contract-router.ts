import express from 'express';
import { contractController } from './contract-controller';
import { mockAuthMiddleware } from '../../middlewares/mock-auth-middleware';

export const contractRouter = express.Router();

// 모든 contract 라우트에 mockAuthMiddleware 적용
contractRouter.use(mockAuthMiddleware);

// Contract CRUD
contractRouter.post('/', contractController.create);
contractRouter.get('/', contractController.get);
contractRouter.patch('/:id', contractController.update);
contractRouter.delete('/:id', contractController.delete);

// 추가 정보 조회
contractRouter.get('/cars', contractController.getCarInfo);
contractRouter.get('/customers', contractController.getCustomerInfo);
contractRouter.get('/users', contractController.getUserInfo);
contractRouter.get('/cars/:id', contractController.getCarById);

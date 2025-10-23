import express from 'express';
import { contractController } from './contracts-controller';
import authenticateToken from '../../middleware/auth-middleware';

export const contractRouter = express.Router();

contractRouter.use(authenticateToken);

// Contract CRUD
contractRouter.post('/', contractController.create);
contractRouter.get('/', contractController.get);
contractRouter.patch('/:id', contractController.update);
contractRouter.delete('/:id', contractController.delete);

// 추가 정보 조회
contractRouter.get('/cars', contractController.getCarInfo);
contractRouter.get('/customers', contractController.getCustomerInfo);
contractRouter.get('/users', contractController.getUserInfo);

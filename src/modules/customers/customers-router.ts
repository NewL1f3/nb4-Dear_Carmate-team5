import express from 'express';
import customerController from './customers-controller';
import authenticateToken from '../../middlewares/auth-middleware';

const customerRouter = express.Router();

customerRouter.post('', authenticateToken, customerController.postCustomer);
customerRouter.get('', authenticateToken, customerController.getManyCustomer);

customerRouter.get('/:customerId', authenticateToken, customerController.getOneCustomer);
customerRouter.patch('/:customerId', authenticateToken, customerController.patchCustomer);
customerRouter.delete('/:customerId', authenticateToken, customerController.deleteCustomer);

customerRouter.post('/upload', authenticateToken, customerController.uploadCustomers);

export default customerRouter;

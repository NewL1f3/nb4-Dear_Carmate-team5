import express from 'express';
import customerController from './customer';
const customerRouter = express.Router();

customerRouter.post('', customerController.postCustomer);
customerRouter.get('', customerController.getManyCustomer);

customerRouter.get('/:customerId', customerController.getOneCustomer);
customerRouter.patch('/:customerId', customerController.patchCustomer);
customerRouter.delete('/:customerId', customerController.deleteCustomer);

customerRouter.post('/upload', customerController.uploadCustomer);

export default customerRouter;

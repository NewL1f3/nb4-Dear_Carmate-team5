import express from 'express';
import companyController from './company-controller';
import { requireAuth } from '../../middlewares/auth';
import authenticateToken from '../../middlewares/auth-middleware';

const companyRouter = express.Router();

companyRouter.post('/', authenticateToken, requireAuth, companyController.postCompany);
companyRouter.get('/', authenticateToken, requireAuth, companyController.getCompanies);
companyRouter.get('/users', authenticateToken, requireAuth, companyController.getcompanyUsers);
companyRouter.patch('/:companyId', authenticateToken, requireAuth, companyController.updateCompany);
companyRouter.delete('/:companyId', authenticateToken, requireAuth, companyController.deleteCompany);

export default companyRouter;

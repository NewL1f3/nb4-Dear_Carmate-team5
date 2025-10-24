import express from 'express';
import { getDashboard } from './dashboard-controller';
import authenticateToken from '../../middlewares/auth-middleware';

const dashboardRouter = express.Router();

dashboardRouter.get('', authenticateToken, getDashboard);

export default dashboardRouter;

import express from 'express';
import { getDashboard } from './dashboard-controller';

const dashboardRouter = express.Router();

dashboardRouter.get('', getDashboard);

export default dashboardRouter;

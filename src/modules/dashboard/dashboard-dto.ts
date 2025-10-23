import { Request } from 'express';

export interface dashboardRequest extends Request {
  user?: any;
}

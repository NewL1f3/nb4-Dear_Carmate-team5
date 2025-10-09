import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';

export interface ValidatedRequest extends Request {
  parsedParams?: unknown;
  parsedBody?: unknown;
  parsedQuery?: unknown;
}

export const validateParams = <TParams extends ZodObject<ZodRawShape>>(schema: TParams) => {
  return async (req: ValidatedRequest, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.params);
      if (!success) {
        return next(error);
      }

      req.parsedParams = data;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const validateQuery = <TQuery extends ZodObject<ZodRawShape>>(schema: TQuery) => {
  return async (req: ValidatedRequest, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.query);
      if (!success) {
        return next(error);
      }

      req.parsedQuery = data;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const validateBody = <TBody extends ZodObject<ZodRawShape>>(schema: TBody) => {
  return async (req: ValidatedRequest, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.body);
      if (!success) {
        return next(error);
      }

      req.parsedBody = data;

      next();
    } catch (err) {
      next(err);
    }
  };
};

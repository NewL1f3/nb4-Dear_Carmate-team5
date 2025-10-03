import type { Request, Response, NextFunction } from 'express';
import type { z, ZodObject, ZodRawShape } from 'zod';

export const validateParams = <TParams extends ZodObject<ZodRawShape>>(schema: TParams) => {
  return async (req: Request<z.infer<TParams>>, _res: Response, next: NextFunction) => {
    try {
      const { success, data, error } = schema.safeParse(req.params);
      if (!success) {
        return next(error);
      }

      req.params = data;

      next();
    } catch (err) {
      next(err);
    }
  };
};

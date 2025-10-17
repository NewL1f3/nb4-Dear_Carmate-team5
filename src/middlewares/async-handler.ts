import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = <T extends Request>(
  requestHandler: (req: T, res: Response, next: NextFunction) => Promise<any>,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await requestHandler(req as T, res, next);
    } catch (error) {
      next(error);
    }
  };
};
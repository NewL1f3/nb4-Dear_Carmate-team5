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
      const { success, data, error } = schema.parse(req.query);
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

// // Params만 사용할 경우
// export type ValidatedParams<P> = ValidatedRequest<P, unknown, unknown>;
// // Body만 사용할 경우
// export type ValidatedBody<B> = ValidatedRequest<unknown, B, unknown>;
// // Query만 사용할 경우
// export type ValidatedQuery<Q> = ValidatedRequest<unknown, unknown, Q>;
// // Params와 Body를 사용할 경우
// export type ValidatedParamsAndBody<P, B> = ValidatedRequest<P, B, unknown>;

// export interface ValidatedRequest<P = unknown, B = unknown, Q = unknown> extends Request {
//   parsedParams?: P;
//   parsedBody?: B;
//   parsedQuery?: Q;
// }

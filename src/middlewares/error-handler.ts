import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/error-class';
import { ZodError } from 'zod';

// 에러 핸들러
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // HttpError 에러 처리 (커스텀 에러)
  if (err instanceof HttpError) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
    }

    console.error(`PROGRAMMING ERROR [${err.name}]:`, err);
    return res.status(500).json({
      status: 'error',
      message: '서버 내부에서 예상치 못한 오류가 발생했습니다.',
    });
  }

  // Zod 에러 처리
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Prisma 에러 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflict',
          message: `'${err.meta?.target}' 필드에 중복된 값이 존재합니다.`,
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not Found',
          message: '요청한 리소스를 찾을 수 없습니다.',
        });
      default:
        console.error(`DATABASE ERROR [${err.code}]:`, err);
        return res.status(500).json({
          error: 'Database Error',
          message: '데이터베이스 작업 중 오류가 발생했습니다.',
        });
    }
  }

  // 그 외 모든 예외적인 에러 처리
  console.error('UNHANDLED SERVER ERROR:', err);

  return res.status(500).json({
    status: 'error',
    message: '서버 내부에서 예상치 못한 오류가 발생했습니다.',
  });
};

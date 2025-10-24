export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'HttpError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = '잘못된 요청 데이터입니다.') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = '인증 정보가 유효하지 않습니다.') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = '이 리소스에 접근할 권한이 없습니다.') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = '이미 존재하는 리소스입니다.') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = '서버 내부 오류가 발생했습니다.') {
    super(500, message, false);
    this.name = 'InternalServerError';
  }
}

export class NotImplementedError extends HttpError {
  constructor(message: string = '요청하신 기능은 아직 구현되지 않았습니다.') {
    super(501, message);
    this.name = 'NotImplementedError';
  }
}

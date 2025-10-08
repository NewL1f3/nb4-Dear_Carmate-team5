interface error extends Error {
  status?: number;
}

export const unauthorizedError: error = new Error();
unauthorizedError.message = '로그인이 필요합니다';
unauthorizedError.status = 401;

export const serverError: error = new Error();
serverError.message = '서버 에러';
serverError.status = 500;

export const databaseCheckError: error = new Error();
databaseCheckError.message = '데이터베이스를 조회하는데 실패하였습니다';
databaseCheckError.status = 500;

export const wrongInputError: error = new Error();
wrongInputError.message = '잘못된 요청입니다';
wrongInputError.status = 400;

export const noCustomerError: error = new Error();
noCustomerError.message = '존재하지 않는 고객입니다';
noCustomerError.status = 404;

export const badRequestError: error = new Error();
badRequestError.message = '잘못된 요청입니다';
badRequestError.status = 400;

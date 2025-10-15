import express from "express";
import companyController from "./company-controller";
import { requireAuth } from "../../middleware/auth";

const companyRouter = express.Router();

// 'http://localhost:3000/companies/' post request가 오면 requireAuth함수 , companyController.postCompany함수 순서대로 실행을 시켜줘
companyRouter.post('/', requireAuth, companyController.postCompany);
companyRouter.get('/', requireAuth, companyController.getCompanies);
// get 'http://localhost:3000/companies?page=2&pageSize=10'

companyRouter.get('/users', requireAuth, )

//  patch 'http://localhost:3000/companies/:companyId' requireAuth 가오면 
companyRouter.patch('/:companyId', requireAuth, companyController.updateCompany);
companyRouter.delete('/:companyId', requireAuth, companyController.deleteCompany);

/*

사용자     ->     backend
요청(request)을 보냄
http method 라는 방식(get, post, patch, delete)
  - get : backend에 있는 자원을 가져오고싶어 
  - post: backend에 자원을 등록하고 싶어 
  - patch: backend에 있는 자원을 수정하고 싶어
  - delete: backend에 있는 자원을 삭제하고 싶어

request에 함께 오는 것들이 있거든요?

ex)
GET request: {
    header: {
        Authorization: Bearer token
    },
    body: {
        "companyName": "string",
        "companyCode": "string"
    }
}

request에 담긴 정보들을 바탕으로 
response를 사용자에게 줘야 함

*/


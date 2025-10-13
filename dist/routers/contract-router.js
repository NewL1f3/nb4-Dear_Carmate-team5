"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractRouter = void 0;
const express_1 = __importDefault(require("express"));
const contract_controller_1 = require("../controllers/contract-controller");
const mock_auth_middleware_1 = require("../middlewares/mock-auth-middleware");
exports.contractRouter = express_1.default.Router();
// 모든 contract 라우트에 mockAuthMiddleware 적용
exports.contractRouter.use(mock_auth_middleware_1.mockAuthMiddleware);
// Contract CRUD
exports.contractRouter.post('/', contract_controller_1.contractController.create);
exports.contractRouter.get('/', contract_controller_1.contractController.get);
exports.contractRouter.patch('/:id', contract_controller_1.contractController.update);
exports.contractRouter.delete('/:id', contract_controller_1.contractController.delete);
// 추가 정보 조회
exports.contractRouter.get('/cars', contract_controller_1.contractController.getCarInfo);
exports.contractRouter.get('/customers', contract_controller_1.contractController.getCustomerInfo);
exports.contractRouter.get('/users', contract_controller_1.contractController.getUserInfo);
//# sourceMappingURL=contract-router.js.map
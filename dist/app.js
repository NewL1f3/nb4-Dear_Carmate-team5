"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contract_router_1 = require("./routers/contract-router");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Contract 라우터 등록
app.use('/contracts', contract_router_1.contractRouter);
app.listen(3000, () => console.log('서버 시작'));
//# sourceMappingURL=app.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuthMiddleware = void 0;
const mockAuthMiddleware = (req, res, next) => {
    req.user = {
        id: 1,
        name: "테스트 유저",
        email: "test@example.com",
        companyId: 1,
        employeeNumber: "EMP001",
        phoneNumber: "010-0000-0000",
        imageUrl: null,
        isAdmin: true,
        password: "mock",
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    console.log(`[Mock Auth] 사용자 ID ${req.user.id} 주입 완료.`);
    next();
};
exports.mockAuthMiddleware = mockAuthMiddleware;
//# sourceMappingURL=mock-auth-middleware.js.map
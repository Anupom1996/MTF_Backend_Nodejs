"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdminLoginRequest = void 0;
const express_validator_1 = require("express-validator");
exports.validateAdminLoginRequest = [
    express_validator_1.body('email').exists({ checkFalsy: true }).withMessage('emailRequired'),
    express_validator_1.body('password').exists({ checkFalsy: true }).withMessage('passwordRequired'),
];
//# sourceMappingURL=index.js.map
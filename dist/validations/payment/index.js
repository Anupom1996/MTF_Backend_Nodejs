"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobPaymentRequest = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
exports.validateJobPaymentRequest = [
    express_validator_1.body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
    express_validator_1.body('jobId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobId');
        }
        return true;
    }),
    express_validator_1.body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
    express_validator_1.body('jobApplyId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobApplyId');
        }
        return true;
    }),
];
//# sourceMappingURL=index.js.map
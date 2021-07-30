"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobApplyCancelRequest = exports.validateJobApplyIdParam = exports.validateParam = exports.validateSaveJobApplyRequest = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
exports.validateSaveJobApplyRequest = [
    express_validator_1.body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
    express_validator_1.body('jobId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobIdObject');
        }
        return true;
    }),
    express_validator_1.check('serviceTime').custom((value) => {
        if (value) {
            if (!moment_1.default(value, 'MM/DD/YYYY HH:mm', true).isValid()) {
                throw new Error('InvalidTimeFormat');
            }
        }
        return true;
    }),
];
exports.validateParam = [
    express_validator_1.param('jobId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobIdObject');
        }
        return true;
    }),
];
exports.validateJobApplyIdParam = [
    express_validator_1.param('jobApplyId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobApplyObjectId');
        }
        return true;
    }),
];
exports.validateJobApplyCancelRequest = [
    express_validator_1.body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
    express_validator_1.body('jobApplyId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobApplyObjectId');
        }
        return true;
    }),
];
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobCancelRequest = exports.validateJobApprovalRequest = exports.validateGetJobByIdRequest = exports.validateSaveJobRequest = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
exports.validateSaveJobRequest = [
    express_validator_1.body('serviceCategoryId').exists({ checkFalsy: true }).withMessage('serviceCategoryIdRequired'),
    express_validator_1.body('serviceSubCategoryId')
        .exists({ checkFalsy: true })
        .withMessage('serviceSubCategoryIdRequired'),
    express_validator_1.body('serviceCategoryId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidCategoryObjectId');
        }
        return true;
    }),
    express_validator_1.body('serviceSubCategoryId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidSubCategoryObjectId');
        }
        return true;
    }),
    express_validator_1.body('location')
        .exists({ checkFalsy: true })
        .withMessage('jobLocationIsReequired')
        .bail()
        .isMongoId()
        .withMessage('invalidObjectId'),
    express_validator_1.body('duration')
        .exists({ checkFalsy: true })
        .withMessage('durationIsReequired')
        .bail()
        .isInt()
        .withMessage('durationMustBeAInteger'),
    // body('title')
    //   .exists({ checkFalsy: true })
    //   .withMessage('titleIsReequired')
    //   .bail()
    //   .isLength({ min: 4 })
    //   .withMessage('jobTitleMin'),
    // body('description')
    //   .exists({ checkFalsy: true })
    //   .withMessage('descriptionIsReequired')
    //   .bail()
    //   .isLength({ min: 4 })
    //   .withMessage('descriptionMin'),
    /*
     * Validation fixed and flexible time
     * Either fixed or flexible time required
     * every time format must follow (DD/MM/YYYY hh:mm)
     */
    express_validator_1.body('fixedTime').custom((value, { req }) => {
        if ((req.body.start && req.body.end) || req.body.fixedTime) {
            if (req.body.start) {
                if (!moment_1.default(req.body.start, 'MM/DD/YYYY HH:mm', true).isValid()) {
                    throw new Error('InvalidTimeFormat');
                }
            }
            if (req.body.end) {
                if (!moment_1.default(req.body.end, 'MM/DD/YYYY HH:mm', true).isValid()) {
                    throw new Error('InvalidTimeFormat');
                }
            }
            if (req.body.fixedTime) {
                if (!moment_1.default(req.body.fixedTime, 'MM/DD/YYYY HH:mm', true).isValid()) {
                    throw new Error('InvalidTimeFormat');
                }
            }
            if (req.body.start && req.body.end) {
                if (req.body.fixedTime) {
                    throw new Error('flexibleOrFixedRequired');
                }
                if (req.body.start === req.body.end) {
                    throw new Error('startEndDiffErr');
                }
                else {
                    if (moment_1.default(new Date(req.body.start)).valueOf() > moment_1.default(new Date(req.body.end)).valueOf()) {
                        throw new Error('startEndDiffErr');
                    }
                }
            }
            else {
                if (req.body.start && req.body.end) {
                    throw new Error('flexibleOrFixedRequired');
                }
            }
            return true;
        }
        throw new Error('flexibleOrFixedRequired');
    }),
    express_validator_1.body('contactPersonName').custom((value, { req }) => {
        if (!req.body.contactPersonName && !req.body.contactPersonNumber) {
            return true;
        }
        if (req.body.contactPersonName && req.body.contactPersonNumber) {
            if (req.body.contactPersonName.length > 3) {
                if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(req.body.contactPersonNumber)) {
                    return true;
                }
                else {
                    throw new Error('invalidMobileNumber');
                }
            }
            else {
                throw new Error('nameMin');
            }
        }
        throw new Error('contactNameAndNoRequired');
    }),
];
exports.validateGetJobByIdRequest = [
    express_validator_1.param('jobId').custom((value) => {
        console.log(value);
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobIdObject');
        }
        return true;
    }),
];
exports.validateJobApprovalRequest = [
    express_validator_1.body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
    express_validator_1.body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
];
exports.validateJobCancelRequest = [
    express_validator_1.body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
    express_validator_1.body('jobId').custom((value) => {
        if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
            throw new Error('InvalidJobId');
        }
        return true;
    }),
];
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddressUpdateRequest = exports.validateAddressRequest = exports.validateChangePasswordRequest = exports.validateResetPasswordRequest = exports.validateUserForgotPasswordRequest = exports.validateResentOtpRequest = exports.validateOptVerificationRequest = exports.validateUserUpdateRequest = exports.validateUserLoginRequest = exports.validateSaveUserRequest = void 0;
const express_validator_1 = require("express-validator");
const model_1 = require("@modules/users/model");
const mongoose_1 = __importDefault(require("mongoose"));
const moment_1 = __importDefault(require("moment"));
exports.validateSaveUserRequest = [
    express_validator_1.body('firstName')
        .exists({ checkFalsy: true })
        .withMessage('firstNameRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('firstNameMin'),
    express_validator_1.body('lastName')
        .exists({ checkFalsy: true })
        .withMessage('lastNameRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('lastNameMin'),
    express_validator_1.body('email')
        .exists({ checkFalsy: true })
        .withMessage('emailRequired')
        .bail()
        .isEmail()
        .withMessage('invalidEmailFormat'),
    express_validator_1.body('password')
        .exists({ checkFalsy: true })
        .withMessage('passwordRequired')
        .bail()
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
        .withMessage('invalidPasswordFormat'),
    express_validator_1.body('mobileNumber').custom((value) => {
        if (!value) {
            return true;
        }
        if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(value)) {
            return true;
        }
        throw new Error('invalidMobileNumber');
    }),
    express_validator_1.body('type')
        .exists({ checkFalsy: true })
        .withMessage('typeRequired')
        .bail()
        .isIn([model_1.UserType.customer, model_1.UserType.serviceProfessional])
        .withMessage('invalidType'),
    express_validator_1.body('professional').custom((value, { req }) => {
        if (!req.body.professional) {
            return true;
        }
        if (req.body.professional.bankAccountNo) {
            if (req.body.professional.bankIdentityCode) {
                if (req.body.professional.skills.length > 0) {
                    for (const id of req.body.professional.skills) {
                        if (!mongoose_1.default.Types.ObjectId.isValid(id))
                            throw new Error('serviceSubCategoryIdRequired');
                    }
                    if (req.body.professional.days.length > 0 && req.body.professional.days.length < 8) {
                        if (req.body.professional.start) {
                            if (!moment_1.default(req.body.professional.start, 'HH:mm', true).isValid())
                                throw new Error('InvalidProfessionalTime');
                            if (req.body.professional.end) {
                                if (!moment_1.default(req.body.professional.end, 'HH:mm', true).isValid())
                                    throw new Error('InvalidProfessionalTime');
                                if (req.body.professional.serviceArea.length > 0) {
                                    return true;
                                }
                                else {
                                    throw new Error('serviceAreaRequired');
                                }
                            }
                            else {
                                throw new Error('endRequired');
                            }
                        }
                        else {
                            throw new Error('startRequired');
                        }
                    }
                    else {
                        throw new Error('daysRequired');
                    }
                }
                else {
                    throw new Error('skillsRequired');
                }
            }
            else {
                throw new Error('bankIdentityRequired');
            }
        }
        else {
            throw new Error('bankAcctRequired');
        }
    }),
];
exports.validateUserLoginRequest = [
    express_validator_1.body('email').exists({ checkFalsy: true }).withMessage('emailRequired'),
    express_validator_1.body('password').exists({ checkFalsy: true }).withMessage('passwordRequired'),
];
exports.validateUserUpdateRequest = [
    express_validator_1.body('firstName')
        .exists({ checkFalsy: true })
        .withMessage('firstNameRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('firstNameMin'),
    express_validator_1.body('lastName')
        .exists({ checkFalsy: true })
        .withMessage('lastNameRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('lastNameMin'),
    express_validator_1.body('mobileNumber').custom((value) => {
        if (!value) {
            return true;
        }
        if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(value)) {
            return true;
        }
        throw new Error('invalidMobileNumber');
    }),
];
exports.validateOptVerificationRequest = [
    express_validator_1.body('email')
        .exists({ checkFalsy: true })
        .withMessage('emailRequired')
        .bail()
        .isEmail()
        .withMessage('invalidEmailFormat'),
    express_validator_1.body('otp').exists({ checkFalsy: true }).withMessage('otpRequired'),
];
exports.validateResentOtpRequest = [
    express_validator_1.body('email')
        .exists({ checkFalsy: true })
        .withMessage('emailRequired')
        .bail()
        .isEmail()
        .withMessage('invalidEmailFormat'),
];
exports.validateUserForgotPasswordRequest = [
    express_validator_1.body('email')
        .exists({ checkFalsy: true })
        .withMessage('emailRequired')
        .bail()
        .isEmail()
        .withMessage('invalidEmailFormat'),
];
exports.validateResetPasswordRequest = [
    express_validator_1.body('newPassword')
        .exists({ checkFalsy: true })
        .withMessage('passwordRequired')
        .bail()
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
        .withMessage('invalidPasswordFormat'),
];
exports.validateChangePasswordRequest = [
    express_validator_1.body('currentPassword')
        .exists({ checkFalsy: true })
        .withMessage('currentPasswordRequired')
        .bail()
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
        .withMessage('invalidCurrentPassword'),
    express_validator_1.body('newPassword')
        .exists({ checkFalsy: true })
        .withMessage('newPasswordRequired')
        .bail()
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
        .withMessage('invalidNewPassword'),
];
exports.validateAddressRequest = [
    express_validator_1.body().isArray(),
    express_validator_1.body('*.title')
        .exists({ checkFalsy: true })
        .withMessage('titleRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('titleMin'),
    express_validator_1.body('*.house')
        .exists({ checkFalsy: true })
        .withMessage('houseRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('houseMin'),
    express_validator_1.body('*.street')
        .exists({ checkFalsy: true })
        .withMessage('streetRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('streetMin'),
    express_validator_1.body('*.province').exists({ checkFalsy: true }).withMessage('provinceRequired').bail(),
    express_validator_1.body('*.zip')
        .exists({ checkFalsy: true })
        .withMessage('zipRequired')
        .bail()
        .isInt()
        .withMessage('zipMustBeAInteger'),
    express_validator_1.body('*.latitude')
        .exists({ checkFalsy: true })
        .withMessage('latitudeRequired')
        .bail()
        .isNumeric(),
    express_validator_1.body('*.longitude')
        .exists({ checkFalsy: true })
        .withMessage('longitudeRequired')
        .bail()
        .isNumeric(),
];
exports.validateAddressUpdateRequest = [
    express_validator_1.body('title')
        .exists({ checkFalsy: true })
        .withMessage('titleRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('titleMin'),
    express_validator_1.body('house')
        .exists({ checkFalsy: true })
        .withMessage('houseRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('houseMin'),
    express_validator_1.body('street')
        .exists({ checkFalsy: true })
        .withMessage('streetRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('streetMin'),
    express_validator_1.body('province')
        .exists({ checkFalsy: true })
        .withMessage('provinceRequired')
        .bail()
        .isLength({ min: 3 })
        .withMessage('houseMin'),
    express_validator_1.body('zip')
        .exists({ checkFalsy: true })
        .withMessage('zipRequired')
        .bail()
        .isInt()
        .withMessage('zipMustBeAInteger'),
    express_validator_1.body('latitude').exists({ checkFalsy: true }).withMessage('latitudeRequired').bail().isNumeric(),
    express_validator_1.body('longitude')
        .exists({ checkFalsy: true })
        .withMessage('longitudeRequired')
        .bail()
        .isNumeric(),
];
//# sourceMappingURL=index.js.map
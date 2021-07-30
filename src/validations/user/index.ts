import { body } from 'express-validator';
import { UserType } from '@modules/users/model';
import mongoose from 'mongoose';
import moment from 'moment';

export const validateSaveUserRequest = [
  body('firstName')
    .exists({ checkFalsy: true })
    .withMessage('firstNameRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('firstNameMin'),
  body('lastName')
    .exists({ checkFalsy: true })
    .withMessage('lastNameRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('lastNameMin'),
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('emailRequired')
    .bail()
    .isEmail()
    .withMessage('invalidEmailFormat'),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('passwordRequired')
    .bail()
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
    .withMessage('invalidPasswordFormat'),
  body('mobileNumber').custom((value) => {
    if (!value) {
      return true;
    }
    if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(value)) {
      return true;
    }
    throw new Error('invalidMobileNumber');
  }),
  body('type')
    .exists({ checkFalsy: true })
    .withMessage('typeRequired')
    .bail()
    .isIn([UserType.customer, UserType.serviceProfessional])
    .withMessage('invalidType'),
  body('professional').custom((value, { req }) => {
    if (!req.body.professional) {
      return true;
    }
    if (req.body.professional.bankAccountNo) {
      if (req.body.professional.bankIdentityCode) {
        if (req.body.professional.skills.length > 0) {
          for (const id of req.body.professional.skills) {
            if (!mongoose.Types.ObjectId.isValid(id))
              throw new Error('serviceSubCategoryIdRequired');
          }
          if (req.body.professional.days.length > 0 && req.body.professional.days.length < 8) {
            if (req.body.professional.start) {
              if (!moment(req.body.professional.start, 'HH:mm', true).isValid())
                throw new Error('InvalidProfessionalTime');
              if (req.body.professional.end) {
                if (!moment(req.body.professional.end, 'HH:mm', true).isValid())
                  throw new Error('InvalidProfessionalTime');
                if (req.body.professional.serviceArea.length > 0) {
                  return true;
                } else {
                  throw new Error('serviceAreaRequired');
                }
              } else {
                throw new Error('endRequired');
              }
            } else {
              throw new Error('startRequired');
            }
          } else {
            throw new Error('daysRequired');
          }
        } else {
          throw new Error('skillsRequired');
        }
      } else {
        throw new Error('bankIdentityRequired');
      }
    } else {
      throw new Error('bankAcctRequired');
    }
  }),
];

export const validateUserLoginRequest = [
  body('email').exists({ checkFalsy: true }).withMessage('emailRequired'),
  body('password').exists({ checkFalsy: true }).withMessage('passwordRequired'),
];

export const validateUserUpdateRequest = [
  body('firstName')
    .exists({ checkFalsy: true })
    .withMessage('firstNameRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('firstNameMin'),
  body('lastName')
    .exists({ checkFalsy: true })
    .withMessage('lastNameRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('lastNameMin'),
  body('mobileNumber').custom((value) => {
    if (!value) {
      return true;
    }
    if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(value)) {
      return true;
    }
    throw new Error('invalidMobileNumber');
  }),
];

export const validateOptVerificationRequest = [
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('emailRequired')
    .bail()
    .isEmail()
    .withMessage('invalidEmailFormat'),
  body('otp').exists({ checkFalsy: true }).withMessage('otpRequired'),
];

export const validateResentOtpRequest = [
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('emailRequired')
    .bail()
    .isEmail()
    .withMessage('invalidEmailFormat'),
];

export const validateUserForgotPasswordRequest = [
  body('email')
    .exists({ checkFalsy: true })
    .withMessage('emailRequired')
    .bail()
    .isEmail()
    .withMessage('invalidEmailFormat'),
];

export const validateResetPasswordRequest = [
  body('newPassword')
    .exists({ checkFalsy: true })
    .withMessage('passwordRequired')
    .bail()
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
    .withMessage('invalidPasswordFormat'),
];

export const validateChangePasswordRequest = [
  body('currentPassword')
    .exists({ checkFalsy: true })

    .withMessage('currentPasswordRequired')
    .bail()
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
    .withMessage('invalidCurrentPassword'),
  body('newPassword')
    .exists({ checkFalsy: true })
    .withMessage('newPasswordRequired')
    .bail()
    .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
    .withMessage('invalidNewPassword'),
];

export const validateAddressRequest = [
  body().isArray(),
  body('*.title')
    .exists({ checkFalsy: true })
    .withMessage('titleRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('titleMin'),
  body('*.house')
    .exists({ checkFalsy: true })
    .withMessage('houseRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('houseMin'),
  body('*.street')
    .exists({ checkFalsy: true })
    .withMessage('streetRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('streetMin'),
  body('*.province').exists({ checkFalsy: true }).withMessage('provinceRequired').bail(),
  body('*.zip')
    .exists({ checkFalsy: true })
    .withMessage('zipRequired')
    .bail()
    .isInt()
    .withMessage('zipMustBeAInteger'),
  body('*.latitude')
    .exists({ checkFalsy: true })
    .withMessage('latitudeRequired')
    .bail()
    .isNumeric(),
  body('*.longitude')
    .exists({ checkFalsy: true })
    .withMessage('longitudeRequired')
    .bail()
    .isNumeric(),
];

export const validateAddressUpdateRequest = [
  body('title')
    .exists({ checkFalsy: true })
    .withMessage('titleRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('titleMin'),
  body('house')
    .exists({ checkFalsy: true })
    .withMessage('houseRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('houseMin'),
  body('street')
    .exists({ checkFalsy: true })
    .withMessage('streetRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('streetMin'),
  body('province')
    .exists({ checkFalsy: true })
    .withMessage('provinceRequired')
    .bail()
    .isLength({ min: 3 })
    .withMessage('houseMin'),
  body('zip')
    .exists({ checkFalsy: true })
    .withMessage('zipRequired')
    .bail()
    .isInt()
    .withMessage('zipMustBeAInteger'),
  body('latitude').exists({ checkFalsy: true }).withMessage('latitudeRequired').bail().isNumeric(),
  body('longitude')
    .exists({ checkFalsy: true })
    .withMessage('longitudeRequired')
    .bail()
    .isNumeric(),
];

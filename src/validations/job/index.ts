import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import moment from 'moment';

export const validateSaveJobRequest = [
  body('serviceCategoryId').exists({ checkFalsy: true }).withMessage('serviceCategoryIdRequired'),
  body('serviceSubCategoryId')
    .exists({ checkFalsy: true })
    .withMessage('serviceSubCategoryIdRequired'),
  body('serviceCategoryId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidCategoryObjectId');
    }
    return true;
  }),
  body('serviceSubCategoryId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidSubCategoryObjectId');
    }
    return true;
  }),
  body('location')
    .exists({ checkFalsy: true })
    .withMessage('jobLocationIsReequired')
    .bail()
    .isMongoId()
    .withMessage('invalidObjectId'),
  body('duration')
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
  body('fixedTime').custom((value, { req }) => {
    if ((req.body.start && req.body.end) || req.body.fixedTime) {
      if (req.body.start) {
        if (!moment(req.body.start, 'MM/DD/YYYY HH:mm', true).isValid()) {
          throw new Error('InvalidTimeFormat');
        }
      }
      if (req.body.end) {
        if (!moment(req.body.end, 'MM/DD/YYYY HH:mm', true).isValid()) {
          throw new Error('InvalidTimeFormat');
        }
      }
      if (req.body.fixedTime) {
        if (!moment(req.body.fixedTime, 'MM/DD/YYYY HH:mm', true).isValid()) {
          throw new Error('InvalidTimeFormat');
        }
      }
      if (req.body.start && req.body.end) {
        if (req.body.fixedTime) {
          throw new Error('flexibleOrFixedRequired');
        }
        if (req.body.start === req.body.end) {
          throw new Error('startEndDiffErr');
        } else {
          if (
            moment(new Date(req.body.start)).valueOf() > moment(new Date(req.body.end)).valueOf()
          ) {
            throw new Error('startEndDiffErr');
          }
        }
      } else {
        if (req.body.start && req.body.end) {
          throw new Error('flexibleOrFixedRequired');
        }
      }
      return true;
    }
    throw new Error('flexibleOrFixedRequired');
  }),

  body('contactPersonName').custom((value, { req }) => {
    if (!req.body.contactPersonName && !req.body.contactPersonNumber) {
      return true;
    }

    if (req.body.contactPersonName && req.body.contactPersonNumber) {
      if (req.body.contactPersonName.length > 3) {
        if (/^(0)(1|2|3|5|7|8|9)(\d{8}|\d{9})$/.test(req.body.contactPersonNumber)) {
          return true;
        } else {
          throw new Error('invalidMobileNumber');
        }
      } else {
        throw new Error('nameMin');
      }
    }
    throw new Error('contactNameAndNoRequired');
  }),
];

export const validateGetJobByIdRequest = [
  param('jobId').custom((value) => {
    console.log(value);
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobIdObject');
    }
    return true;
  }),
];

export const validateJobApprovalRequest = [
  body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
  body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
];

export const validateJobCancelRequest = [
  body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
  body('jobId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobId');
    }
    return true;
  }),
];

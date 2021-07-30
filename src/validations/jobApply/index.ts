import { body, check, param } from 'express-validator';
import mongoose from 'mongoose';
import moment from 'moment';

export const validateSaveJobApplyRequest = [
  body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
  body('jobId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobIdObject');
    }
    return true;
  }),
  check('serviceTime').custom((value) => {
    if (value) {
      if (!moment(value, 'MM/DD/YYYY HH:mm', true).isValid()) {
        throw new Error('InvalidTimeFormat');
      }
    }

    return true;
  }),
];

export const validateParam = [
  param('jobId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobIdObject');
    }
    return true;
  }),
];

export const validateJobApplyIdParam = [
  param('jobApplyId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobApplyObjectId');
    }
    return true;
  }),
];

export const validateJobApplyCancelRequest = [
  body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
  body('jobApplyId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobApplyObjectId');
    }
    return true;
  }),
];

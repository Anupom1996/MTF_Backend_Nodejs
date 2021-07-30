import { body } from 'express-validator';
import mongoose from 'mongoose';

export const validateJobPaymentRequest = [
  body('jobId').exists({ checkFalsy: true }).withMessage('jobIdRequired'),
  body('jobId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobId');
    }
    return true;
  }),
  body('jobApplyId').exists({ checkFalsy: true }).withMessage('jobApplyIdRequired'),
  body('jobApplyId').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('InvalidJobApplyId');
    }
    return true;
  }),
];

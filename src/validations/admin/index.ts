import { body } from 'express-validator';

export const validateAdminLoginRequest = [
  body('email').exists({ checkFalsy: true }).withMessage('emailRequired'),
  body('password').exists({ checkFalsy: true }).withMessage('passwordRequired'),
];

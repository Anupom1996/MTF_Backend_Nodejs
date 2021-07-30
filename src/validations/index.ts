import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    const extractedErrors: string[] = [];
    errors.array().map((err) => extractedErrors.push(res.__(err.msg)));
    res.badRequest(extractedErrors);
  }
};

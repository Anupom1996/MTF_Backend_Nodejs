import { Request, Response, NextFunction } from 'express';

/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    if (process.env.API_KEY === apiKey) {
      next();
    } else {
      res.forbidden('');
    }
  } else {
    res.forbidden('');
  }
};

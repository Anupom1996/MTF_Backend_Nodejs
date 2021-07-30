/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @typescript-eslint/no-explicit-any disabled as
 * we are overriding express method here
 * we want to forward the all type data via this middleware
 * */
import { Request, Response, NextFunction } from 'express';

/**
 * This function is used for sending 200 response
 * @param req
 * @param res
 * @param next
 */
const ok = (req: Request, res: Response, next: NextFunction) => {
  res.ok = (data: any) => {
    const response = {
      status: 200,
      message: res.__('success'),
      data: data,
    };
    return res.send(response);
  };
  next();
};

/**
 * This function is used for sending 201 response
 * @param req
 * @param res
 * @param next
 */
const created = (req: Request, res: Response, next: NextFunction) => {
  res.created = (data: any) => {
    const response = {
      status: 201,
      message: res.__('created'),
      data: data,
    };
    return res.status(201).json(response);
  };
  next();
};

/**
 * This function is used for sending 204 response
 * @param req
 * @param res
 * @param next
 */
const noData = (req: Request, res: Response, next: NextFunction) => {
  res.noData = (data: any) => {
    const response = {
      status: 204,
      message: res.__('noDataFound'),
      data: data,
    };
    return res.status(200).json(response);
  };
  next();
};

/**
 * This function is used for sending 400 response
 * @param req
 * @param res
 * @param next
 */
const badRequest = (req: Request, res: Response, next: NextFunction) => {
  res.badRequest = (errors: [string]) => {
    const response = {
      status: 400,
      errors: errors,
    };
    return res.status(400).json(response);
  };
  next();
};

/**
 * This function is used for sending 401 response
 * @param req
 * @param res
 * @param next
 */
const unAuthorized = (req: Request, res: Response, next: NextFunction) => {
  res.unAuthorized = (message: any, reason: string = '') => {
    const response = {
      status: 401,
      message: message ? message : res.__('unAuthorizedAccess'),
      reason,
    };
    return res.status(401).json(response);
  };
  next();
};

/**
 * This function is used for sending 403 response
 * @param req
 * @param res
 * @param next
 */
const forbidden = (req: Request, res: Response, next: NextFunction) => {
  res.forbidden = (message: any) => {
    const response = {
      status: 403,
      message: message ? message : res.__('forbidden'),
    };
    return res.status(403).json(response);
  };
  next();
};

/**
 * This function is used for sending 500 response
 * @param req
 * @param res
 * @param next
 */
const serverError = (req: Request, res: Response, next: NextFunction) => {
  res.serverError = (err: any) => {
    const response = {
      status: 500,
      message: res.__('serverError'),
      err: err,
    };
    return res.status(500).json(response);
  };
  next();
};

export const overrideResponse = [
  ok,
  created,
  noData,
  badRequest,
  unAuthorized,
  forbidden,
  serverError,
];

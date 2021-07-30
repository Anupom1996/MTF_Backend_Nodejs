import { Request, Response, NextFunction } from 'express';
import { AdminService } from '@services/admin';
import { IAdminRequestObject } from '@modules/admin/model';

/**
 * This function is admin for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
export const validateAdminAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.token;
  if (token) {
    const adminService = new AdminService();

    const decodedData = await adminService
      .verifyAdminToken(token, process.env.USER_ACCESS_TOKEN_SECRET || '')
      .catch((err) => {
        const isExpired: boolean = err.name == 'TokenExpiredError' ? true : false;
        res.unAuthorized(
          [res.__(isExpired ? 'expiredToken' : 'invalidAccessToken')],
          isExpired ? 'expired' : 'invalid',
        );
        throw err;
      });

    if (decodedData) {
      const adminService = new AdminService();

      const adminDetails = await adminService
        .getAdminDetailsById(decodedData.id)
        .catch((err: Error) => {
          res.serverError(err);
          throw err;
        });
      if (adminDetails) {
        const resAdminDetails: IAdminRequestObject = adminDetails.toObject();
        req['adminDetails'] = resAdminDetails;
        next();
      } else {
        res.unAuthorized([res.__('invalidAccessToken')]);
      }
    } else {
      res.unAuthorized([res.__('invalidAccessToken')]);
    }
  } else {
    res.unAuthorized('');
  }
};

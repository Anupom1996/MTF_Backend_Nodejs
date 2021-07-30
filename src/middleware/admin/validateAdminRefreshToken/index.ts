import { Request, Response, NextFunction } from 'express';
import { AdminService } from '@services/admin';
import { IAdminRequestObject } from '@modules/admin/model';
/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
export const validateAdminRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.token;
  if (token) {
    const adminService = new AdminService();
    const decodedData = await adminService
      .verifyAdminToken(token, process.env.USER_REFRESH_TOKEN_SECRET || '')
      .catch((err) => {
        res.forbidden('');
        throw err;
      });

    if (decodedData) {
      const adminService = new AdminService();
      const adminDetails = await adminService.getAdminDetailsById(decodedData.id).catch((err) => {
        res.serverError(err);
        throw err;
      });
      if (adminDetails) {
        const resAdminDetails: IAdminRequestObject = adminDetails.toObject();
        req['adminDetails'] = resAdminDetails;
        next();
      } else {
        res.forbidden('');
      }
    } else {
      res.forbidden('');
    }
  } else {
    res.forbidden('');
  }
};

import { Request, Response, NextFunction } from 'express';
import { UserService } from '@services/users';
import { IUserRequestObject } from '@modules/users/model';
/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
export const validateUserRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.token;
  if (token) {
    const userService = new UserService();
    const decodedData = await userService
      .verifyUserToken(token, process.env.USER_REFRESH_TOKEN_SECRET || '')
      .catch((err) => {
        res.forbidden('');
        throw err;
      });
    if (decodedData) {
      const userService = new UserService();
      const userDetails = await userService.getUserDetailsById(decodedData.id).catch((err) => {
        res.serverError(err);
        throw err;
      });
      if (userDetails) {
        const resUserDetails: IUserRequestObject = userDetails.toObject();
        req['userDetails'] = resUserDetails;
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

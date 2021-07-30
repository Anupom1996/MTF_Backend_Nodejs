import { Request, Response, NextFunction } from 'express';
import { UserService } from '@services/users';
import { IUserRequestObject } from '@modules/users/model';

/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
export const validateUserAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.token;
  if (token) {
    const userService = new UserService();

    const decodedData = await userService
      .verifyUserToken(token, process.env.USER_ACCESS_TOKEN_SECRET || '')
      .catch((err) => {
        const isExpired: boolean = err.name == 'TokenExpiredError' ? true : false;
        res.unAuthorized(
          [res.__(isExpired ? 'expiredToken' : 'invalidAccessToken')],
          isExpired ? 'expired' : 'invalid',
        );
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
        res.unAuthorized([res.__('invalidAccessToken')]);
      }
    } else {
      res.unAuthorized([res.__('invalidAccessToken')]);
    }
  } else {
    res.unAuthorized('');
  }
};

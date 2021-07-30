import { Router, Request, Response } from 'express';
import { UserController } from '@controllers/user';
import {
  validateApiKey,
  validateUserAccessToken,
  validateUserRefreshToken,
} from '@middleware/index';
import {
  validateSaveUserRequest,
  validateUserLoginRequest,
  validateUserUpdateRequest,
  validateOptVerificationRequest,
  validateResentOtpRequest,
  validateResetPasswordRequest,
  validateChangePasswordRequest,
  // validateAddressRequest,
  // validateAddressUpdateRequest,
  validateUserForgotPasswordRequest,
} from '@validations/user';
import { validate } from '@validations/index';

const userRouter = Router();
const userCtrl = new UserController();

userRouter.post(
  '/signup',
  validateApiKey,
  validateSaveUserRequest,
  validate,
  (req: Request, res: Response) => userCtrl.createUser(req, res),
);

userRouter.post(
  '/otp-verification',
  validateApiKey,
  validateOptVerificationRequest,
  validate,
  (req: Request, res: Response) => userCtrl.otpVerification(req, res),
);

userRouter.post(
  '/resent-otp',
  validateApiKey,
  validateResentOtpRequest,
  validate,
  (req: Request, res: Response) => userCtrl.resentOtp(req, res),
);

userRouter.post(
  '/login/:id',
  validateApiKey,
  validateUserLoginRequest,
  validate,
  (req: Request, res: Response) => userCtrl.userLogin(req, res),
);

userRouter.get('/me', validateApiKey, validateUserAccessToken, (req: Request, res: Response) =>
  userCtrl.getCurrentUserDetails(req, res),
);

userRouter.get('/token', validateApiKey, validateUserRefreshToken, (req: Request, res: Response) =>
  userCtrl.genrateNewToken(req, res),
);

userRouter.post(
  '/forgot-password',
  validateApiKey,
  validateUserForgotPasswordRequest,
  validate,
  (req: Request, res: Response) => userCtrl.forgotPassword(req, res),
);

userRouter.put(
  '/reset-password',
  validateApiKey,
  validateResetPasswordRequest,
  validate,
  (req: Request, res: Response) => userCtrl.resetPassword(req, res),
);

userRouter.put(
  '/change-password',
  validateApiKey,
  validateUserAccessToken,
  validateChangePasswordRequest,
  validate,
  (req: Request, res: Response) => userCtrl.changePassword(req, res),
);

userRouter.put(
  '/update',
  validateApiKey,
  validateUserAccessToken,
  validateUserUpdateRequest,
  validate,
  (req: Request, res: Response) => userCtrl.updateUserDetails(req, res),
);

userRouter.post(
  '/add-addresses',
  validateApiKey,
  validateUserAccessToken,
  (req: Request, res: Response) => userCtrl.addAddress(req, res),
);

// userRouter.put(
//   '/update-address/:id',
//   validateApiKey,
//   validateUserAccessToken,
//   validateAddressUpdateRequest,
//   validate,
//   (req: Request, res: Response) => userCtrl.updateAddress(req, res),
// );

userRouter.delete(
  '/delete-address/:id',
  validateApiKey,
  validateUserAccessToken,
  (req: Request, res: Response) => userCtrl.deleteAddress(req, res),
);

userRouter.get(
  '/get-user-addresses',
  validateApiKey,
  validateUserAccessToken,
  (req: Request, res: Response) => userCtrl.getAddresses(req, res),
);

export { userRouter };

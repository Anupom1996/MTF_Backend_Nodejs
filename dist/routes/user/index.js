"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_1 = require("@controllers/user");
const index_1 = require("@middleware/index");
const user_2 = require("@validations/user");
const index_2 = require("@validations/index");
const userRouter = express_1.Router();
exports.userRouter = userRouter;
const userCtrl = new user_1.UserController();
userRouter.post('/signup', index_1.validateApiKey, user_2.validateSaveUserRequest, index_2.validate, (req, res) => userCtrl.createUser(req, res));
userRouter.post('/otp-verification', index_1.validateApiKey, user_2.validateOptVerificationRequest, index_2.validate, (req, res) => userCtrl.otpVerification(req, res));
userRouter.post('/resent-otp', index_1.validateApiKey, user_2.validateResentOtpRequest, index_2.validate, (req, res) => userCtrl.resentOtp(req, res));
userRouter.post('/login/:id', index_1.validateApiKey, user_2.validateUserLoginRequest, index_2.validate, (req, res) => userCtrl.userLogin(req, res));
userRouter.get('/me', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => userCtrl.getCurrentUserDetails(req, res));
userRouter.get('/token', index_1.validateApiKey, index_1.validateUserRefreshToken, (req, res) => userCtrl.genrateNewToken(req, res));
userRouter.post('/forgot-password', index_1.validateApiKey, user_2.validateUserForgotPasswordRequest, index_2.validate, (req, res) => userCtrl.forgotPassword(req, res));
userRouter.put('/reset-password', index_1.validateApiKey, user_2.validateResetPasswordRequest, index_2.validate, (req, res) => userCtrl.resetPassword(req, res));
userRouter.put('/change-password', index_1.validateApiKey, index_1.validateUserAccessToken, user_2.validateChangePasswordRequest, index_2.validate, (req, res) => userCtrl.changePassword(req, res));
userRouter.put('/update', index_1.validateApiKey, index_1.validateUserAccessToken, user_2.validateUserUpdateRequest, index_2.validate, (req, res) => userCtrl.updateUserDetails(req, res));
userRouter.post('/add-addresses', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => userCtrl.addAddress(req, res));
// userRouter.put(
//   '/update-address/:id',
//   validateApiKey,
//   validateUserAccessToken,
//   validateAddressUpdateRequest,
//   validate,
//   (req: Request, res: Response) => userCtrl.updateAddress(req, res),
// );
userRouter.delete('/delete-address/:id', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => userCtrl.deleteAddress(req, res));
userRouter.get('/get-user-addresses', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => userCtrl.getAddresses(req, res));
//# sourceMappingURL=index.js.map
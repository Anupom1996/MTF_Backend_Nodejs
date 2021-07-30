"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const users_1 = require("@services/users");
const model_1 = require("@modules/users/model");
const model_2 = require("@modules/email/model");
const email_1 = require("@services/email");
const common_1 = require("@services/common");
const service_1 = require("@services/service");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    constructor() {
        this.userService = new users_1.UserService();
        this.emailService = new email_1.EmailService();
        this.serviceService = new service_1.ServiceService();
        this.commonService = new common_1.CommonService();
        this.passwordSaltRound = process.env.PASSWORD_SALT_ROUND
            ? Number(process.env.PASSWORD_SALT_ROUND)
            : 10;
    }
    /**
     * Add new user
     */
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // // existing user verification
            const reqBody = req.body;
            const isEmailUnique = yield this.userService.checkUniqueEmail(reqBody.email).catch((err) => {
                res.serverError(err);
                throw err;
            });
            // user registration process
            if (isEmailUnique) {
                reqBody.password = yield bcrypt_1.default.hash(reqBody.password, this.passwordSaltRound);
                const user = yield this.userService.saveUser(reqBody).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (reqBody.professional) {
                    yield this.serviceService
                        .saveUniqueServiceArea(reqBody.professional.serviceArea)
                        .catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                }
                // getting 6 digit otp
                const randomOtp = yield this.commonService.generateOtp();
                // parameters of sendOtp function
                const options = yield this.commonService.otpMailOptions(model_2.EmailType.Otp, user.name.first, randomOtp, user.email);
                const otp = yield bcrypt_1.default.hash(randomOtp, this.passwordSaltRound);
                // Getting expiry time for otp
                const timeStamp = yield this.commonService.generateTimestamp();
                // function for saving otp in db
                yield this.userService.saveOtp(user._id, otp, timeStamp);
                this.emailService.sendMail(options);
                res.created('created');
            }
            else {
                res.badRequest([res.__('duplicateEmail')]);
            }
        });
    }
    /**
     * This function is responsible for user Login
     * @param req email password
     * @param res
     */
    userLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            const userType = req.params.id;
            // get user details by email
            const userDetails = yield this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (userDetails) {
                // user must be currect type
                if (userDetails.type === userType) {
                    // password compare process
                    const isSame = yield bcrypt_1.default.compare(reqBody.password, userDetails.password).catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    if (isSame) {
                        // Check for user verified otp or not
                        if (userDetails.status === model_1.IUserStatus.InActive) {
                            res.forbidden(res.__('otpNotVerified'));
                        }
                        else if (userDetails.status === model_1.IUserStatus.notApproved) {
                            res.forbidden(res.__('notApprovedYet'));
                        }
                        else {
                            res.ok(this.userService.genrateUserTokens(userDetails));
                        }
                    }
                    else {
                        res.badRequest([res.__('invalidCredentials')]);
                    }
                }
                else {
                    res.badRequest([res.__('invalidCredentials')]);
                }
            }
            else {
                res.badRequest([res.__('invalidCredentials')]);
            }
        });
    }
    /**
     * This function is used for fetching current user details
     * @param req
     * @param res
     */
    getCurrentUserDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.ok(req.userDetails);
        });
    }
    /**
     * This function is used for genrating new refresh token
     * @param req
     * @param res
     */
    genrateNewToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.userDetails) {
                res.ok(this.userService.genrateUserTokens(req.userDetails));
            }
            else {
                res.forbidden('unAuthorizedAccess');
            }
        });
    }
    /**
     * This function is used for updating user details
     * @param req
     * @param res
     */
    updateUserDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            const id = req.userDetails._id;
            // Responsible fot update user details
            const user = yield this.userService.updateUser(id, reqBody).catch((err) => {
                res.serverError(err);
                throw err;
            });
            res.ok(user);
        });
    }
    /**
     * Function responsible for forgot password
     * Send otp in user mail
     */
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // Get user details by email id
            const userDetails = yield this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (userDetails) {
                // getting 6 digit otp
                const otp = yield this.commonService.generateOtp();
                // parameters of sendOtp function
                const options = yield this.commonService.otpMailOptions(model_2.EmailType.Otp, userDetails.name.first, otp, userDetails.email);
                // Getting expiry time for otp
                const timeStamp = yield this.commonService.generateTimestamp();
                // function for saving otp in db
                yield this.userService.saveOtp(userDetails._id, otp, timeStamp);
                this.emailService.sendMail(options);
                res.ok('otpSent');
            }
            else {
                res.badRequest([res.__('userIsNotValid')]);
            }
        });
    }
    /**
     * Otp verification
     * @param req email otp
     * @param res success
     */
    otpVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // getting all user details by provided email
            const userDetails = yield this.userService
                .getUserDetailsByEmail(reqBody.email)
                .catch((error) => {
                res.serverError(error);
                throw error;
            });
            if (userDetails) {
                // get otp details by user id
                const otpDetails = yield this.userService
                    .getOtpDetailsByUserId(userDetails._id)
                    .catch((error) => {
                    res.serverError(error);
                    throw error;
                });
                const isExpired = yield bcrypt_1.default.compare(reqBody.otp, otpDetails.otp).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (!isExpired) {
                    res.badRequest([res.__('invalidOtp')]);
                }
                else {
                    // Comparing expiry time with current time
                    const currentTime = new Date();
                    if (currentTime.valueOf() > otpDetails.expiryTime.valueOf()) {
                        res.forbidden('');
                    }
                    // used to update collections after verify otp
                    yield this.userService.verifiedOtp(userDetails._id).catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    return res.ok(this.userService.genrateUserTokens(userDetails));
                }
            }
            else {
                res.badRequest([res.__('userIsNotValid')]);
            }
        });
    }
    /**
     * Responsible for resent otp in the given email id
     */
    resentOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // existing user verification
            const user = yield this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (user) {
                if (user.status === model_1.IUserStatus.InActive) {
                    // getting 6 digit otp
                    const randomOtp = yield this.commonService.generateOtp();
                    // parameters of sendOtp function
                    const options = yield this.commonService.otpMailOptions(model_2.EmailType.Otp, user.name.first, randomOtp, user.email);
                    const otp = yield bcrypt_1.default.hash(randomOtp, this.passwordSaltRound);
                    // Getting expiry time for otp
                    const timeStamp = yield this.commonService.generateTimestamp();
                    // Function for updating otp in previous field
                    yield this.userService.updateOtp(user._id, otp, timeStamp);
                    this.emailService.sendMail(options);
                    res.ok('otpSent');
                }
            }
            else {
                res.badRequest([res.__('emailNotExist')]);
            }
        });
    }
    /**
     * This function is used for reset password
     * @param req new password
     * @param res current password
     */
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // get otp details
            const otpDetails = yield this.userService.getOtpDetails(reqBody.otp).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (otpDetails) {
                // Comparing expiry time with current time
                const currentTime = new Date();
                if (currentTime.valueOf() > otpDetails.expiryTime.valueOf()) {
                    res.badRequest([res.__('invalidOtp')]);
                }
                // get user details
                const userDetails = yield this.userService
                    .getUserDetailsForChangePassword(otpDetails.userId)
                    .catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (userDetails) {
                    // bcrypt new password
                    const newPassword = yield bcrypt_1.default.hash(reqBody.newPassword, this.passwordSaltRound);
                    res.ok(this.userService.resetPassword(userDetails._id, newPassword));
                }
                else {
                    res.badRequest([res.__('notAValidUser')]);
                }
            }
            else {
                res.badRequest([res.__('wrongOtp')]);
            }
        });
    }
    /**
     * This function is used for change password
     * @param req
     * @param res
     */
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // get user details by id
            const userDetails = yield this.userService
                .getUserDetailsForChangePassword(req.userDetails._id)
                .catch((error) => {
                console.log(error);
                throw error;
            });
            if (userDetails) {
                // compare the given current password with the actual password
                const isSame = yield bcrypt_1.default
                    .compare(reqBody.currentPassword, userDetails.password)
                    .catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (isSame) {
                    reqBody.newPassword = yield bcrypt_1.default.hash(reqBody.newPassword, this.passwordSaltRound);
                    // send response after change password
                    res.ok(this.userService.resetPassword(req.userDetails._id, reqBody.newPassword));
                }
                else {
                    res.badRequest([res.__('currentPasswordNotValid')]);
                }
            }
            else {
                res.badRequest([res.__('invaildRequest')]);
            }
        });
    }
    /**
     * Responsible for adding multiple addresses
     * @param {Request} req
     * @param {Response} res
     */
    addAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            const id = req.userDetails._id;
            const userAddresses = req.userDetails.addresses;
            // adding multiple addresses in db
            const user = yield this.userService.addAddress(id, userAddresses, reqBody).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (user) {
                res.ok(user.addresses.pop());
            }
        });
    }
    /**
     * Responsible for updating address
     * @param {Request} req addressId
     * @param {Response} res
     */
    // public async updateAddress(req: Request, res: Response): Promise<void> {
    //   const addressId = req.params.id;
    //   const reqBody: ICreateAddressRequest = req.body;
    //   const userId: mongoose.Types.ObjectId = req.userDetails._id;
    //   const addresses = req.userDetails.addresses;
    //   let flag = false;
    //   /**
    //    * Checking address id exist in db or not
    //    * If exist update the address
    //    */
    //   for (const element of addresses) {
    //     if (element._id == addressId) {
    //       flag = true;
    //       element.address.title = reqBody.title;
    //       element.address.house = reqBody.house;
    //       element.address.street = reqBody.street;
    //       element.address.province = reqBody.province;
    //       element.address.zip = reqBody.zip;
    //       element.address.location = [reqBody.latitude, reqBody.longitude];
    //       break;
    //     }
    //   }
    //   if (flag) {
    //     // updating particular address in db
    //     const user = await this.userService.updateAddress(userId, addresses).catch((err) => {
    //       res.serverError(err);
    //       throw err;
    //     });
    //     const updatedAddr = [];
    //     for (const obj of user.addresses) {
    //       if (JSON.stringify(obj._id) === JSON.stringify(addressId)) {
    //         updatedAddr.push(obj);
    //       }
    //     }
    //     if (user) {
    //       return res.ok(updatedAddr);
    //     }
    //   } else {
    //     res.badRequest([res.__('invalidAddressId')]);
    //   }
    // }
    /**
     * Responsible for deleting particular address
     * @param {Request} req addressId
     * @param {Response} res
     */
    deleteAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressId = req.params.id;
            const userId = req.userDetails._id;
            const addresses = req.userDetails.addresses;
            let flag = false;
            // Checking address id exist in db or not
            addresses.forEach((element) => {
                if (element._id == addressId) {
                    flag = true;
                }
            });
            if (flag) {
                // Delete particular address from db
                yield this.userService.deleteAddress(userId, addressId, addresses).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                res.ok(res.__('deleteAddress'));
            }
            else {
                res.badRequest([res.__('invalidAddressId')]);
            }
        });
    }
    /**
     * Responsible for fetching user addresses
     * @param {Request} req addressId
     * @param {Response} res
     */
    getAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = req.userDetails.addresses;
            if (addresses[0]) {
                res.ok(addresses);
            }
            else {
                return res.noData(res.__('noAddresses'));
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=index.js.map
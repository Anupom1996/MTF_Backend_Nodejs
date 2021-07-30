import { Request, Response } from 'express';
import { UserService } from '@services/users';
import {
  ICreateUserRequest,
  ILoginUserRequest,
  IUserUpdateRequest,
  IOtpVerificationRequest,
  IResentOtpRequest,
  IUserForgotPasswordRequest,
  IUserResetPasswordRequest,
  IUserChangePasswordRequest,
  ICreateAddressRequest,
  IUserStatus,
  IAddressResponseObject,
} from '@modules/users/model';
import { EmailType } from '@modules/email/model';
import { EmailService } from '@services/email';
import { CommonService } from '@services/common';
import { ServiceService } from '@services/service';
import bcrypt from 'bcrypt';

export class UserController {
  private userService: UserService;
  private emailService: EmailService;
  private commonService: CommonService;
  private serviceService: ServiceService;
  private passwordSaltRound: number;

  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
    this.serviceService = new ServiceService();
    this.commonService = new CommonService();
    this.passwordSaltRound = process.env.PASSWORD_SALT_ROUND
      ? Number(process.env.PASSWORD_SALT_ROUND)
      : 10;
  }

  /**
   * Add new user
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    // // existing user verification
    const reqBody: ICreateUserRequest = req.body;
    const isEmailUnique = await this.userService.checkUniqueEmail(reqBody.email).catch((err) => {
      res.serverError(err);
      throw err;
    });

    // user registration process
    if (isEmailUnique) {
      reqBody.password = await bcrypt.hash(reqBody.password, this.passwordSaltRound);
      const user = await this.userService.saveUser(reqBody).catch((err) => {
        res.serverError(err);
        throw err;
      });

      if (reqBody.professional) {
        await this.serviceService
          .saveUniqueServiceArea(reqBody.professional.serviceArea)
          .catch((err) => {
            res.serverError(err);
            throw err;
          });
      }

      // getting 6 digit otp
      const randomOtp = await this.commonService.generateOtp();
      // parameters of sendOtp function
      const options = await this.commonService.otpMailOptions(
        EmailType.Otp,
        user.name.first,
        randomOtp,
        user.email,
      );

      const otp = await bcrypt.hash(randomOtp, this.passwordSaltRound);
      // Getting expiry time for otp
      const timeStamp = await this.commonService.generateTimestamp();
      // function for saving otp in db
      await this.userService.saveOtp(user._id, otp, timeStamp);
      this.emailService.sendMail(options);
      res.created('created');
    } else {
      res.badRequest([res.__('duplicateEmail')]);
    }
  }

  /**
   * This function is responsible for user Login
   * @param req email password
   * @param res
   */
  public async userLogin(req: Request, res: Response): Promise<void> {
    const reqBody: ILoginUserRequest = req.body;
    const userType = req.params.id;
    // get user details by email
    const userDetails = await this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (userDetails) {
      // user must be currect type
      if (userDetails.type === userType) {
        // password compare process
        const isSame = await bcrypt.compare(reqBody.password, userDetails.password).catch((err) => {
          res.serverError(err);
          throw err;
        });
        if (isSame) {
          // Check for user verified otp or not
          if (userDetails.status === IUserStatus.InActive) {
            res.forbidden(res.__('otpNotVerified'));
          } else if (userDetails.status === IUserStatus.notApproved) {
            res.forbidden(res.__('notApprovedYet'));
          } else {
            res.ok(this.userService.genrateUserTokens(userDetails));
          }
        } else {
          res.badRequest([res.__('invalidCredentials')]);
        }
      } else {
        res.badRequest([res.__('invalidCredentials')]);
      }
    } else {
      res.badRequest([res.__('invalidCredentials')]);
    }
  }

  /**
   * This function is used for fetching current user details
   * @param req
   * @param res
   */
  public async getCurrentUserDetails(req: Request, res: Response): Promise<void> {
    res.ok(req.userDetails);
  }

  /**
   * This function is used for genrating new refresh token
   * @param req
   * @param res
   */
  public async genrateNewToken(req: Request, res: Response): Promise<void> {
    if (req.userDetails) {
      res.ok(this.userService.genrateUserTokens(req.userDetails));
    } else {
      res.forbidden('unAuthorizedAccess');
    }
  }

  /**
   * This function is used for updating user details
   * @param req
   * @param res
   */
  public async updateUserDetails(req: Request, res: Response): Promise<void> {
    const reqBody: IUserUpdateRequest = req.body;
    const id: string = req.userDetails._id;
    // Responsible fot update user details
    const user = await this.userService.updateUser(id, reqBody).catch((err) => {
      res.serverError(err);
      throw err;
    });

    res.ok(user);
  }

  /**
   * Function responsible for forgot password
   * Send otp in user mail
   */

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const reqBody: IUserForgotPasswordRequest = req.body;
    // Get user details by email id
    const userDetails = await this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (userDetails) {
      // getting 6 digit otp
      const otp = await this.commonService.generateOtp();

      // parameters of sendOtp function
      const options = await this.commonService.otpMailOptions(
        EmailType.Otp,
        userDetails.name.first,
        otp,
        userDetails.email,
      );

      // Getting expiry time for otp
      const timeStamp = await this.commonService.generateTimestamp();
      // function for saving otp in db
      await this.userService.saveOtp(userDetails._id, otp, timeStamp);
      this.emailService.sendMail(options);
      res.ok('otpSent');
    } else {
      res.badRequest([res.__('userIsNotValid')]);
    }
  }

  /**
   * Otp verification
   * @param req email otp
   * @param res success
   */
  public async otpVerification(req: Request, res: Response): Promise<void> {
    const reqBody: IOtpVerificationRequest = req.body;

    // getting all user details by provided email
    const userDetails = await this.userService
      .getUserDetailsByEmail(reqBody.email)
      .catch((error: Error) => {
        res.serverError(error);
        throw error;
      });

    if (userDetails) {
      // get otp details by user id
      const otpDetails = await this.userService
        .getOtpDetailsByUserId(userDetails._id)
        .catch((error: Error) => {
          res.serverError(error);
          throw error;
        });

      const isExpired = await bcrypt.compare(reqBody.otp, otpDetails.otp).catch((err) => {
        res.serverError(err);
        throw err;
      });
      if (!isExpired) {
        res.badRequest([res.__('invalidOtp')]);
      } else {
        // Comparing expiry time with current time
        const currentTime = new Date();
        if (currentTime.valueOf() > otpDetails.expiryTime.valueOf()) {
          res.forbidden('');
        }
        // used to update collections after verify otp
        await this.userService.verifiedOtp(userDetails._id).catch((err) => {
          res.serverError(err);
          throw err;
        });
        return res.ok(this.userService.genrateUserTokens(userDetails));
      }
    } else {
      res.badRequest([res.__('userIsNotValid')]);
    }
  }

  /**
   * Responsible for resent otp in the given email id
   */
  public async resentOtp(req: Request, res: Response): Promise<void> {
    const reqBody: IResentOtpRequest = req.body;
    // existing user verification
    const user = await this.userService.getUserDetailsByEmail(reqBody.email).catch((err) => {
      res.serverError(err);
      throw err;
    });

    if (user) {
      if (user.status === IUserStatus.InActive) {
        // getting 6 digit otp
        const randomOtp = await this.commonService.generateOtp();
        // parameters of sendOtp function
        const options = await this.commonService.otpMailOptions(
          EmailType.Otp,
          user.name.first,
          randomOtp,
          user.email,
        );

        const otp = await bcrypt.hash(randomOtp, this.passwordSaltRound);
        // Getting expiry time for otp
        const timeStamp = await this.commonService.generateTimestamp();
        // Function for updating otp in previous field
        await this.userService.updateOtp(user._id, otp, timeStamp);
        this.emailService.sendMail(options);
        res.ok('otpSent');
      }
    } else {
      res.badRequest([res.__('emailNotExist')]);
    }
  }

  /**
   * This function is used for reset password
   * @param req new password
   * @param res current password
   */

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const reqBody: IUserResetPasswordRequest = req.body;

    // get otp details
    const otpDetails = await this.userService.getOtpDetails(reqBody.otp).catch((err) => {
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
      const userDetails = await this.userService
        .getUserDetailsForChangePassword(otpDetails.userId)
        .catch((err) => {
          res.serverError(err);
          throw err;
        });
      if (userDetails) {
        // bcrypt new password
        const newPassword = await bcrypt.hash(reqBody.newPassword, this.passwordSaltRound);
        res.ok(this.userService.resetPassword(userDetails._id, newPassword));
      } else {
        res.badRequest([res.__('notAValidUser')]);
      }
    } else {
      res.badRequest([res.__('wrongOtp')]);
    }
  }

  /**
   * This function is used for change password
   * @param req
   * @param res
   */

  public async changePassword(req: Request, res: Response): Promise<void> {
    const reqBody: IUserChangePasswordRequest = req.body;

    // get user details by id
    const userDetails = await this.userService
      .getUserDetailsForChangePassword(req.userDetails._id)
      .catch((error: Error) => {
        console.log(error);
        throw error;
      });

    if (userDetails) {
      // compare the given current password with the actual password
      const isSame = await bcrypt
        .compare(reqBody.currentPassword, userDetails.password)
        .catch((err) => {
          res.serverError(err);
          throw err;
        });
      if (isSame) {
        reqBody.newPassword = await bcrypt.hash(reqBody.newPassword, this.passwordSaltRound);
        // send response after change password
        res.ok(this.userService.resetPassword(req.userDetails._id, reqBody.newPassword));
      } else {
        res.badRequest([res.__('currentPasswordNotValid')]);
      }
    } else {
      res.badRequest([res.__('invaildRequest')]);
    }
  }

  /**
   * Responsible for adding multiple addresses
   * @param {Request} req
   * @param {Response} res
   */
  public async addAddress(req: Request, res: Response): Promise<void> {
    const reqBody: Array<ICreateAddressRequest> = req.body;
    const id: string = req.userDetails._id;
    const userAddresses: Array<IAddressResponseObject> = req.userDetails.addresses;
    // adding multiple addresses in db
    const user = await this.userService.addAddress(id, userAddresses, reqBody).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (user) {
      res.ok(user.addresses.pop());
    }
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
  public async deleteAddress(req: Request, res: Response): Promise<void> {
    const addressId = req.params.id;
    const userId: string = req.userDetails._id;
    const addresses = req.userDetails.addresses;
    let flag = false;
    // Checking address id exist in db or not
    addresses.forEach((element: { _id: string }) => {
      if (element._id == addressId) {
        flag = true;
      }
    });
    if (flag) {
      // Delete particular address from db
      await this.userService.deleteAddress(userId, addressId, addresses).catch((err) => {
        res.serverError(err);
        throw err;
      });

      res.ok(res.__('deleteAddress'));
    } else {
      res.badRequest([res.__('invalidAddressId')]);
    }
  }

  /**
   * Responsible for fetching user addresses
   * @param {Request} req addressId
   * @param {Response} res
   */
  public async getAddresses(req: Request, res: Response): Promise<void> {
    const addresses = req.userDetails.addresses;
    if (addresses[0]) {
      res.ok(addresses);
    } else {
      return res.noData(res.__('noAddresses'));
    }
  }
}

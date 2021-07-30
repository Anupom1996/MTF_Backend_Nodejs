import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '@modules/users/schema';
import otpModel from '@modules/otp/schema';
import {
  ICreateUserRequest,
  IUserStatus,
  IUser,
  IUserTokens,
  IUserRequestObject,
  IUserUpdateRequest,
  ICreateAddressRequest,
  IUserAddress,
  IAddressObject,
  IAddressResponseObject,
  IAddressessResponse,
} from '@modules/users/model';
import { Otp, OtpType } from '@modules/otp/model';
import { Types } from 'mongoose';

export class UserService {
  /**
   * email existence check within DB
   * @param email
   */
  public async checkUniqueEmail(email: string): Promise<boolean> {
    const condition = {
      email: {
        // eslint-disable-next-line no-useless-escape
        $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
      },
    };

    const emailCount = await userModel.countDocuments(condition).catch((error: Error) => {
      throw error;
    });

    return emailCount > 0 ? false : true;
  }

  /**
   * Save new user into db
   * @param userDetails
   */
  public async saveUser(userDetails: ICreateUserRequest): Promise<IUser> {
    const newUser: IUser = new userModel({
      name: {
        first: userDetails.firstName,
        last: userDetails.lastName,
      },
      email: userDetails.email,
      password: userDetails.password,
      mobileNumber: userDetails.mobileNumber,
      type: userDetails.type,
      professional: userDetails.professional
        ? {
            bankDetails: {
              bankAccountNo: userDetails.professional.bankAccountNo,
              bankIdentityCode: userDetails.professional.bankIdentityCode,
            },
            skills: userDetails.professional.skills,
            serviceTime: {
              days: userDetails.professional.days,
              time: {
                start: userDetails.professional.start,
                end: userDetails.professional.end,
              },
            },
            serviceArea: userDetails.professional.serviceArea,
          }
        : null,
    });
    await newUser.save().catch((error: Error) => {
      throw error;
    });
    return newUser;
  }

  /**
   * Responsible to save otp and expiry time in db
   */
  public async saveOtp(id: string, otp: string, expiryTime: Date): Promise<void> {
    const newOtp: Otp = new otpModel({
      userId: id,
      otp,
      otpType: OtpType.Email,
      expiryTime,
    });

    await newOtp.save().catch((error: Error) => {
      throw error;
    });
  }

  /**
   * Responsible to update otp and expiry time in db
   */
  public async updateOtp(id: Types.ObjectId, otp: string, expiryTime: Date): Promise<void> {
    await otpModel
      .updateOne(
        { userId: id },
        {
          $set: {
            otp,
            expiryTime,
          },
        },
      )
      .catch((error: Error) => {
        throw error;
      });
  }

  /**
   * Responsible for updating the fields after otp verification
   * @param id objectId
   */
  public async verifiedOtp(id: string): Promise<void> {
    // user collection update status
    await userModel
      .updateOne(
        { _id: id },
        {
          $set: { isVerifiedEmail: true, status: IUserStatus.notApproved },
        },
      )
      .catch((error: Error) => {
        throw error;
      });

    // otp collection to set null otp and expiry time
    await otpModel
      .updateOne(
        { userId: id },
        {
          $set: { otp: undefined, expiryTime: undefined },
        },
      )
      .catch((error: Error) => {
        throw error;
      });
  }

  public async getUserDetailsByEmail(email: string): Promise<IUser | null> {
    const condition = {
      email: {
        // eslint-disable-next-line no-useless-escape
        $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
      },
    };
    const selection = {
      __v: 0,
    };
    const userDetails = await userModel.findOne(condition, selection).catch((error: Error) => {
      throw error;
    });
    return userDetails;
  }

  public async getOtpDetailsByUserId(id: string): Promise<Otp> {
    const condition = {
      userId: id,
    };
    const selection = {
      __v: 0,
    };
    const otpDetails = await otpModel.findOne(condition, selection).catch((error: Error) => {
      console.log(error);
      throw error;
    });
    return otpDetails;
  }

  /**
   * This function is used for creating user token
   * @param userDetails
   */
  public genrateUserTokens(userDetails: IUser | IUserRequestObject): IUserTokens {
    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
      ? Number(process.env.ACCESS_TOKEN_EXPIRED)
      : 3600;

    const refreshTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
      ? Number(process.env.REFRESH_TOKE_EXPIRED)
      : 3600;

    const accessToken = jwt.sign(
      {
        id: userDetails._id,
        name: userDetails.name,
        email: userDetails.email,
        type: userDetails.type,
      },
      process.env.USER_ACCESS_TOKEN_SECRET || '',
      { expiresIn: accessTokenExpiry },
    );
    const refreshToken = jwt.sign(
      { id: userDetails._id, name: userDetails.name, email: userDetails.email },
      process.env.USER_REFRESH_TOKEN_SECRET || '',
      { expiresIn: refreshTokenExpiry },
    );

    return {
      accessToken: accessToken,
      accessTokenExpiry: accessTokenExpiry,
      refreshToken: refreshToken,
      refreshTokenExpiry: refreshTokenExpiry,
      name: userDetails.name,
      email: userDetails.email,
      _id: userDetails._id,
    };
  }

  /**
   * This function is used for validating user token
   * @param token
   * @param tokenSecret
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public verifyUserToken(token: string, tokenSecret: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, tokenSecret, (err, decodeData) => {
        if (err) {
          reject(err);
        } else {
          resolve(decodeData);
        }
      });
    });
  }

  /**
   * This function is used for getting the user details by id
   * @param id
   * @param callback
   */

  public async getUserDetailsById(id: string): Promise<IUser | null> {
    const condition = {
      _id: mongoose.Types.ObjectId(id),
    };
    const selection = {
      password: 0,
      mobileNumber: 0,
    };
    const userDetails = await userModel.findOne(condition, selection).catch((error: Error) => {
      throw error;
    });
    return userDetails;
  }

  public async getUserDetailsForChangePassword(id: mongoose.Types.ObjectId): Promise<IUser | null> {
    const condition = {
      _id: id,
    };

    const userDetails = await userModel.findOne(condition).catch((error: Error) => {
      throw error;
    });
    return userDetails;
  }

  public async getOtpDetails(otp: string): Promise<Otp | null> {
    const condition = {
      otp: otp,
    };

    const userDetails = await otpModel.findOne(condition).catch((error: Error) => {
      throw error;
    });

    return userDetails;
  }

  /**
   * Update user into db
   * @param accessToken
   * @param userDetails
   */
  public async updateUser(id: string, reqBody: IUserUpdateRequest): Promise<IUser> {
    const user = await userModel
      .findByIdAndUpdate(
        id,
        {
          'name.first': reqBody.firstName,
          'name.last': reqBody.lastName,
          mobileNumber: reqBody.mobileNumber,
        },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });
    return user;
  }

  /**
   * This function is used to update changed password
   * @param userDetails
   */
  public async resetPassword(id: string, password: string): Promise<IUser | null> {
    const userDetails = await userModel
      .findByIdAndUpdate(id, { password: password }, { new: true })
      .catch((err: Error) => {
        throw err;
      });
    return userDetails;
  }

  /**
   * Add multiple address into db
   * @param accessToken
   * @param userDetails
   * @param addressRequest
   */

  public async addAddress(
    id: string,
    userAddresses: Array<IAddressResponseObject>,
    reqBody: Array<ICreateAddressRequest>,
  ): Promise<IAddressessResponse> {
    const addresses: Array<IAddressObject> = userAddresses;
    reqBody.forEach((element) => {
      const address: IUserAddress = {
        address: element.address,
        citytown: element.citytown,
        country: element.country,
        postcode: element.postcode,
      };
      addresses.push({ address: address });
    });
    const user = await userModel
      .findByIdAndUpdate(
        id,
        {
          addresses: addresses,
        },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });

    return user;
  }

  /**
   * Update user address into db
   * @param accessToken
   * @param userDetails
   * @param addressRequest
   */
  public async updateAddress(
    userId: mongoose.Types.ObjectId,
    addresses: Array<IAddressResponseObject>,
  ): Promise<IAddressessResponse> {
    const user = await userModel
      .findByIdAndUpdate(
        userId,
        {
          addresses: addresses,
        },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });

    return user;
  }

  public async deleteAddress(
    userId: string,
    addressId: string,
    addresses: Array<IAddressResponseObject>,
  ): Promise<void> {
    const updatedAddresses = addresses.filter((element) => String(element._id) !== addressId);

    const user = await userModel
      .findByIdAndUpdate(
        userId,
        {
          addresses: updatedAddresses,
        },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });
    return user;
  }
}

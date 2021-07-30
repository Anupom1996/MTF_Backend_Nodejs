import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import adminModel from '@modules/admin/schema';
import userModel from '@modules/users/schema';
import { IAdmin, IAdminTokens } from '@modules/admin/model';
import { IUser, IUserStatus } from '@modules/users/model';

export class AdminService {
  public async getAdminDetailsByEmail(email: string): Promise<IAdmin | null> {
    const condition = {
      email: {
        // eslint-disable-next-line no-useless-escape
        $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
      },
    };
    const selection = {
      __v: 0,
    };
    const adminDetails = await adminModel.findOne(condition, selection).catch((error: Error) => {
      throw error;
    });
    return adminDetails;
  }

  /**
   * This function is used for creating admin token
   * @param adminDetails
   */
  public genrateAdminTokens(adminDetails: IAdmin): IAdminTokens {
    const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
      ? Number(process.env.ACCESS_TOKEN_EXPIRED)
      : 3600;

    const refreshTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
      ? Number(process.env.REFRESH_TOKE_EXPIRED)
      : 3600;

    const accessToken = jwt.sign(
      {
        id: adminDetails._id,
        name: adminDetails.name,
        email: adminDetails.email,
      },
      process.env.USER_ACCESS_TOKEN_SECRET || '',
      { expiresIn: accessTokenExpiry },
    );
    const refreshToken = jwt.sign(
      { id: adminDetails._id, name: adminDetails.name, email: adminDetails.email },
      process.env.USER_REFRESH_TOKEN_SECRET || '',
      { expiresIn: refreshTokenExpiry },
    );

    return {
      accessToken: accessToken,
      accessTokenExpiry: accessTokenExpiry,
      refreshToken: refreshToken,
      refreshTokenExpiry: refreshTokenExpiry,
      name: adminDetails.name,
      email: adminDetails.email,
    };
  }

  /**
   * This function is used for validating admin token
   * @param token
   * @param tokenSecret
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public verifyAdminToken(token: string, tokenSecret: string): Promise<any> {
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
   * This function is used for getting the admin details by id
   * @param id
   * @param callback
   */
  public async getAdminDetailsById(id: string): Promise<IAdmin | null> {
    const condition = {
      _id: mongoose.Types.ObjectId(id),
    };
    const selection = {
      _id: 1,
      name: 1,
      email: 1,
    };
    const adminDetails = await adminModel.findOne(condition, selection).catch((error: Error) => {
      throw error;
    });
    return adminDetails;
  }

  /**
   * This function is used for getting the user listing along with filter
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getUsers(type: any): Promise<IUser | null> {
    const selection = {
      __v: 0,
    };
    const userList = await userModel.find(type, selection).catch((error: Error) => {
      console.log(error);
      throw error;
    });

    return userList;
  }
  public async getUserDetailsById(id: string): Promise<IUser> {
    const condition = {
      _id: mongoose.Types.ObjectId(id),
    };
    const userDetails = await userModel.findOne(condition).catch((error: Error) => {
      throw error;
    });
    return userDetails;
  }
  public async updateStatusInactive(id: string): Promise<void> {
    // user status update status
    await userModel
      .updateOne(
        { _id: id },
        {
          $set: { status: IUserStatus.InActive },
        },
      )
      .catch((error: Error) => {
        throw error;
      });
  }
  public async updateStatusActive(id: string): Promise<void> {
    // user status update status
    await userModel
      .updateOne(
        { _id: id },
        {
          $set: { status: IUserStatus.Active },
        },
      )
      .catch((error: Error) => {
        throw error;
      });
  }

  public async getUsersData(data: any, type: any, limit: number): Promise<IUser | null> {
    const type1 = type;
    console.log(type1);
    let condition: any;
    const text = RegExp('.*' + data + '.*', 'i');
    const selection = {
      __v: 0,
      password: 0,
    };
    if (type1 == null) {
      condition = {
        $or: [
          { email: text },
          { mobileNumber: text },
          { 'name.first': text },
          { 'name.last': text },
        ],
      };
    } else {
      condition = {
        $and: [
          { type: type1 },
          {
            $or: [
              { email: text },
              { mobileNumber: text },
              { 'name.first': text },
              { 'name.last': text },
            ],
          },
        ],
      };
    }

    const userList = await userModel
      .find(condition, selection)
      .limit(limit)
      .catch((error: Error) => {
        console.log(error);
        throw error;
      });

    return userList;
  }
}

import { Document, Types } from 'mongoose';

export enum IAdminStatus {
  Active = 'ACTIVE',
  InActive = 'INACTIVE',
}

interface IAdminName extends Document {
  first: string;
  last: string;
}

export interface IAdmin extends Document {
  name: IAdminName;
  email: string;
  password: string;
  status: IAdminStatus;
}

export interface ILoginAdminRequest {
  email: string;
  password: string;
}

export interface IAdminTokens {
  name: IAdminName;
  email: string;
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
}

export interface IAdminRequestObject {
  _id: Types.ObjectId;
  name: IAdminName;
  email: string;
  status: IAdminStatus;
}

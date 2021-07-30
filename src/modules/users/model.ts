import { Document, Types } from 'mongoose';

export enum IUserStatus {
  Active = 'ACTIVE',
  InActive = 'INACTIVE',
  notApproved = 'NOT_APPROVED',
}

export enum UserType {
  customer = 'CUSTOMER',
  serviceProfessional = 'SERVICE_PROFESSIONAL',
}

export interface IBankDetails {
  bankAccountNo: string;
  bankIdentityCode: string;
}

export interface ITime {
  start: string;
  end: string;
}

export interface IServiceTime {
  days: Array<string>;
  time: ITime;
}

export interface IDbs {
  isVerified: boolean;
}

export interface IProfessional {
  bankDetails: IBankDetails;
  skills: Array<Types.ObjectId>;
  serviceTime: IServiceTime;
  serviceArea: Array<string>;
  dbs: IDbs;
}

export interface IProfessionalRequest {
  bankAccountNo: string;
  bankIdentityCode: string;
  skills: Array<Types.ObjectId>;
  days: Array<string>;
  start: string;
  end: string;
  serviceArea: Array<string>;
}

export interface IUserAddress {
  address: Array<string>;
  citytown: string;
  country: string;
  postcode: string;
  // title: string;
  // house: string;
  // street: string;
  // province: string;
  // zip: number;
  // location: [number, number];
}

export interface IAddressObject {
  address: IUserAddress;
}

export interface IAddressessResponse {
  name: IUserName;
  status: string;
  isVerifiedEmail: boolean;
  _id: Types.ObjectId;
  email: string;
  passoword: string;
  mobileNumber: string;
  type: UserType;
  addresses: Array<IAddressResponseObject>;
}

export interface IAddressResponseObject {
  _id: Types.ObjectId;
  address: IUserAddressModel;
}

export interface IUserAddressModel extends Document {
  address: Array<string>;
  citytown: string;
  country: string;
  postcode: string;
}

interface IUserName extends Document {
  first: string;
  last: string;
}

export interface IUser extends Document {
  name: IUserName;
  email: string;
  password: string;
  status: IUserStatus;
  type: UserType;
  professional: null | IProfessional;
}

export interface IJobResponse {
  name: IUserName;
  email: string;
  password: string;
  status: IUserStatus;
  type: UserType;
  professional: null | IProfessional;
  totalAppliedJobs: 1;
}

export interface ICreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
  address: Array<IUserAddressModel>;
  status: IUserStatus;
  type: UserType;
  professional: IProfessionalRequest;
}

export interface ICreateAddressRequest {
  address: Array<string>;
  citytown: string;
  country: string;
  postcode: string;
}

export interface ILoginUserRequest {
  email: string;
  password: string;
}

export interface IUserTokens {
  _id: Types.ObjectId;
  name: IUserName;
  email: string;
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
}

export interface IUserRequestObject {
  _id: Types.ObjectId;
  name: IUserName;
  email: string;
  status: IUserStatus;
  type: UserType;
}

export interface IUserUpdateRequest {
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface IOtpVerificationRequest {
  email: string;
  otp: string;
}

export interface IResentOtpRequest {
  email: string;
}

export interface IUserForgotPasswordRequest {
  _id: Types.ObjectId;
  email: string;
}

export interface IUserForgotPasswordRequestTokens {
  email: string;
  accessResetToken: string;
  accessResetTokenExpiry: number;
}

export interface IUserResetPasswordRequest {
  otp: string;
  newPassword: string;
}

export interface IUserChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

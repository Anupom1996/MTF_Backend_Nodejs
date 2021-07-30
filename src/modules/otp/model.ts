import { Document, Types } from 'mongoose';

export enum OtpType {
  Email = 'EMAIL',
  Phone = 'PHONE',
}

export interface Otp extends Document {
  userId: Types.ObjectId;
  otp: string;
  type: OtpType;
  expiryTime: Date;
}

import mongoose, { Schema } from 'mongoose';
import { Otp, OtpType } from './model';

const OtpSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  otp: { type: String, required: true },
  otpType: { type: String, enum: [OtpType.Email, OtpType.Phone], required: true },
  expiryTime: { type: Date, required: true },
});

// Export the model and return your IUser interface
export default mongoose.model<Otp>('otpModel', OtpSchema, 'otp');

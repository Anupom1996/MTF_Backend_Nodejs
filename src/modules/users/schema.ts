import mongoose, { Schema } from 'mongoose';
import { IUser, IUserStatus, UserType } from './model';

const ProfessionalSchema: Schema = new Schema({
  bankDetails: {
    bankAccountNo: { type: String, required: true, trim: true },
    bankIdentityCode: { type: String, required: true, trim: true },
  },
  skills: [Schema.Types.ObjectId],
  serviceTime: {
    days: [String],
    time: {
      start: { type: String, trim: true },
      end: { type: String, trim: true },
    },
  },
  serviceArea: [String],
  dbs: {
    isVerified: { type: Boolean, default: true },
  },
});

const UserSchema: Schema = new Schema(
  {
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, require: true, trim: true },
    },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String },
    addresses: [
      {
        address: {
          address: [String],
          citytown: String,
          country: String,
          postcode: String,
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: [IUserStatus.InActive, IUserStatus.Active],
      default: IUserStatus.InActive,
    },

    isVerifiedEmail: { type: Boolean, default: false },
    type: { type: String, required: true, enum: [UserType.customer, UserType.serviceProfessional] },
    professional: null || ProfessionalSchema,
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IUser interface
export default mongoose.model<IUser>('userModel', UserSchema, 'users');

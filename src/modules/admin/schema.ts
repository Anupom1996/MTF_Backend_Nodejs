import mongoose, { Schema } from 'mongoose';
import { IAdmin, IAdminStatus } from './model';

const AdminSchema: Schema = new Schema(
  {
    name: {
      first: { type: String, required: true, trim: true },
      last: { type: String, require: true, trim: true },
    },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [IAdminStatus.InActive, IAdminStatus.Active],
      default: IAdminStatus.Active,
    },
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IUser interface
export default mongoose.model<IAdmin>('adminModel', AdminSchema, 'adminUsers');

import mongoose, { Schema } from 'mongoose';
import { EmailTemplate, EmailType } from './model';

const EmailSchema: Schema = new Schema(
  {
    type: { type: String, enum: [EmailType.Otp, EmailType.ForgetPassword], required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IUser interface
export default mongoose.model<EmailTemplate>('emailTemplatesModel', EmailSchema, 'emailTemplates');

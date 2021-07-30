import { Document } from 'mongoose';

export enum EmailType {
  Otp = 'OTP',
  ForgetPassword = 'FORGET_PASSWORD',
}

export interface EmailTemplate extends Document {
  type: EmailType;
  subject: string;
  content: string;
  status: boolean;
}

export interface OtpSubstitution {
  firstName: string;
  otp: string;
}

export interface ForgetPasswordSubstitution {
  token: string;
}

export interface MailOptions {
  type: EmailType;
  substitutions: OtpSubstitution | ForgetPasswordSubstitution;
  to: string;
}

export interface MailInfo {
  from: string;
  to: string;
  subject: string;
  html: string;
}

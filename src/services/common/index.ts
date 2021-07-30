import { EmailType, MailOptions } from '@modules/email/model';

export class CommonService {
  // Responsible for generating otp
  public async generateOtp(): Promise<string> {
    const randomOtp = String(Math.floor(100000 + Math.random() * 900000));
    return randomOtp;
  }

  // Responsible for generating expiry time of otp
  public async generateTimestamp(): Promise<Date> {
    const timeStamp = new Date(new Date().getTime() + 50 * 60000);
    return timeStamp;
  }

  // Responsible for generating options of otp email
  public async otpMailOptions(
    type: EmailType,
    firstName: string,
    otp: string,
    to: string,
  ): Promise<MailOptions> {
    const options: MailOptions = {
      type,
      substitutions: {
        firstName,
        otp,
      },
      to,
    };
    return options;
  }
}

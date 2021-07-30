import emailTemplatesModel from '@modules/email/schema';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import { MailOptions, EmailTemplate, MailInfo } from '@modules/email/model';

/**
 * Service class for email sending
 */
export class EmailService {
  public async sendMail(options: MailOptions): Promise<void> {
    const emailTemplate: EmailTemplate = await emailTemplatesModel
      .findOne({ type: options.type })
      .catch((error: Error) => {
        console.log(error);
        throw error;
      });

    if (emailTemplate) {
      const template = Handlebars.compile(emailTemplate.content);
      const content = template(options.substitutions);

      const transport = nodemailer.createTransport(
        smtpTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.SMTP_AUTH_EMAIL,
            pass: process.env.SMTP_AUTH_PASSWORD,
          },
        }),
      );

      const mailInfo: MailInfo = {
        from: String(process.env.SMTP_AUTH_EMAIL),
        to: options.to,
        subject: emailTemplate.subject,
        html: content,
      };

      await transport.sendMail(mailInfo).catch((error: Error) => {
        console.log(error);
        throw error;
      });
      console.log('Mail Send!');
    }
  }
}

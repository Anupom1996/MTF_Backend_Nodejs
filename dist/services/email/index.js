"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const schema_1 = __importDefault(require("@modules/email/schema"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_smtp_transport_1 = __importDefault(require("nodemailer-smtp-transport"));
/**
 * Service class for email sending
 */
class EmailService {
    sendMail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailTemplate = yield schema_1.default
                .findOne({ type: options.type })
                .catch((error) => {
                console.log(error);
                throw error;
            });
            if (emailTemplate) {
                const template = handlebars_1.default.compile(emailTemplate.content);
                const content = template(options.substitutions);
                const transport = nodemailer_1.default.createTransport(nodemailer_smtp_transport_1.default({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.SMTP_AUTH_EMAIL,
                        pass: process.env.SMTP_AUTH_PASSWORD,
                    },
                }));
                const mailInfo = {
                    from: String(process.env.SMTP_AUTH_EMAIL),
                    to: options.to,
                    subject: emailTemplate.subject,
                    html: content,
                };
                yield transport.sendMail(mailInfo).catch((error) => {
                    console.log(error);
                    throw error;
                });
                console.log('Mail Send!');
            }
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=index.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonService = void 0;
class CommonService {
    // Responsible for generating otp
    generateOtp() {
        return __awaiter(this, void 0, void 0, function* () {
            const randomOtp = String(Math.floor(100000 + Math.random() * 900000));
            return randomOtp;
        });
    }
    // Responsible for generating expiry time of otp
    generateTimestamp() {
        return __awaiter(this, void 0, void 0, function* () {
            const timeStamp = new Date(new Date().getTime() + 50 * 60000);
            return timeStamp;
        });
    }
    // Responsible for generating options of otp email
    otpMailOptions(type, firstName, otp, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                type,
                substitutions: {
                    firstName,
                    otp,
                },
                to,
            };
            return options;
        });
    }
}
exports.CommonService = CommonService;
//# sourceMappingURL=index.js.map
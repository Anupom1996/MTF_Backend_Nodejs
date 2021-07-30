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
exports.validateUserAccessToken = void 0;
const users_1 = require("@services/users");
/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
exports.validateUserAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (token) {
        const userService = new users_1.UserService();
        const decodedData = yield userService
            .verifyUserToken(token, process.env.USER_ACCESS_TOKEN_SECRET || '')
            .catch((err) => {
            const isExpired = err.name == 'TokenExpiredError' ? true : false;
            res.unAuthorized([res.__(isExpired ? 'expiredToken' : 'invalidAccessToken')], isExpired ? 'expired' : 'invalid');
            throw err;
        });
        if (decodedData) {
            const userService = new users_1.UserService();
            const userDetails = yield userService.getUserDetailsById(decodedData.id).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (userDetails) {
                const resUserDetails = userDetails.toObject();
                req['userDetails'] = resUserDetails;
                next();
            }
            else {
                res.unAuthorized([res.__('invalidAccessToken')]);
            }
        }
        else {
            res.unAuthorized([res.__('invalidAccessToken')]);
        }
    }
    else {
        res.unAuthorized('');
    }
});
//# sourceMappingURL=index.js.map
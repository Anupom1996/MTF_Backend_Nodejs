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
exports.validateAdminRefreshToken = void 0;
const admin_1 = require("@services/admin");
/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
exports.validateAdminRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (token) {
        const adminService = new admin_1.AdminService();
        const decodedData = yield adminService
            .verifyAdminToken(token, process.env.USER_REFRESH_TOKEN_SECRET || '')
            .catch((err) => {
            res.forbidden('');
            throw err;
        });
        if (decodedData) {
            const adminService = new admin_1.AdminService();
            const adminDetails = yield adminService.getAdminDetailsById(decodedData.id).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (adminDetails) {
                const resAdminDetails = adminDetails.toObject();
                req['adminDetails'] = resAdminDetails;
                next();
            }
            else {
                res.forbidden('');
            }
        }
        else {
            res.forbidden('');
        }
    }
    else {
        res.forbidden('');
    }
});
//# sourceMappingURL=index.js.map
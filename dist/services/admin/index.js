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
exports.AdminService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const schema_1 = __importDefault(require("@modules/admin/schema"));
const schema_2 = __importDefault(require("@modules/users/schema"));
const model_1 = require("@modules/users/model");
class AdminService {
    getAdminDetailsByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                email: {
                    // eslint-disable-next-line no-useless-escape
                    $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
                },
            };
            const selection = {
                __v: 0,
            };
            const adminDetails = yield schema_1.default.findOne(condition, selection).catch((error) => {
                throw error;
            });
            return adminDetails;
        });
    }
    /**
     * This function is used for creating admin token
     * @param adminDetails
     */
    genrateAdminTokens(adminDetails) {
        const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
            ? Number(process.env.ACCESS_TOKEN_EXPIRED)
            : 3600;
        const refreshTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
            ? Number(process.env.REFRESH_TOKE_EXPIRED)
            : 3600;
        const accessToken = jsonwebtoken_1.default.sign({
            id: adminDetails._id,
            name: adminDetails.name,
            email: adminDetails.email,
        }, process.env.USER_ACCESS_TOKEN_SECRET || '', { expiresIn: accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ id: adminDetails._id, name: adminDetails.name, email: adminDetails.email }, process.env.USER_REFRESH_TOKEN_SECRET || '', { expiresIn: refreshTokenExpiry });
        return {
            accessToken: accessToken,
            accessTokenExpiry: accessTokenExpiry,
            refreshToken: refreshToken,
            refreshTokenExpiry: refreshTokenExpiry,
            name: adminDetails.name,
            email: adminDetails.email,
        };
    }
    /**
     * This function is used for validating admin token
     * @param token
     * @param tokenSecret
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verifyAdminToken(token, tokenSecret) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, tokenSecret, (err, decodeData) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(decodeData);
                }
            });
        });
    }
    /**
     * This function is used for getting the admin details by id
     * @param id
     * @param callback
     */
    getAdminDetailsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                _id: mongoose_1.default.Types.ObjectId(id),
            };
            const selection = {
                _id: 1,
                name: 1,
                email: 1,
            };
            const adminDetails = yield schema_1.default.findOne(condition, selection).catch((error) => {
                throw error;
            });
            return adminDetails;
        });
    }
    /**
     * This function is used for getting the user listing along with filter
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUsers(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const selection = {
                __v: 0,
            };
            const userList = yield schema_2.default.find(type, selection).catch((error) => {
                console.log(error);
                throw error;
            });
            return userList;
        });
    }
    getUserDetailsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                _id: mongoose_1.default.Types.ObjectId(id),
            };
            const userDetails = yield schema_2.default.findOne(condition).catch((error) => {
                throw error;
            });
            return userDetails;
        });
    }
    updateStatusInactive(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // user status update status
            yield schema_2.default
                .updateOne({ _id: id }, {
                $set: { status: model_1.IUserStatus.InActive },
            })
                .catch((error) => {
                throw error;
            });
        });
    }
    updateStatusActive(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // user status update status
            yield schema_2.default
                .updateOne({ _id: id }, {
                $set: { status: model_1.IUserStatus.Active },
            })
                .catch((error) => {
                throw error;
            });
        });
    }
    getUsersData(data, type, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const type1 = type;
            console.log(type1);
            let condition;
            const text = RegExp('.*' + data + '.*', 'i');
            const selection = {
                __v: 0,
                password: 0,
            };
            if (type1 == null) {
                condition = {
                    $or: [
                        { email: text },
                        { mobileNumber: text },
                        { 'name.first': text },
                        { 'name.last': text },
                    ],
                };
            }
            else {
                condition = {
                    $and: [
                        { type: type1 },
                        {
                            $or: [
                                { email: text },
                                { mobileNumber: text },
                                { 'name.first': text },
                                { 'name.last': text },
                            ],
                        },
                    ],
                };
            }
            const userList = yield schema_2.default
                .find(condition, selection)
                .limit(limit)
                .catch((error) => {
                console.log(error);
                throw error;
            });
            return userList;
        });
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=index.js.map
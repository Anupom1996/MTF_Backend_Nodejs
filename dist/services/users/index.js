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
exports.UserService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const schema_1 = __importDefault(require("@modules/users/schema"));
const schema_2 = __importDefault(require("@modules/otp/schema"));
const model_1 = require("@modules/users/model");
const model_2 = require("@modules/otp/model");
class UserService {
    /**
     * email existence check within DB
     * @param email
     */
    checkUniqueEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                email: {
                    // eslint-disable-next-line no-useless-escape
                    $regex: new RegExp('^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i'),
                },
            };
            const emailCount = yield schema_1.default.countDocuments(condition).catch((error) => {
                throw error;
            });
            return emailCount > 0 ? false : true;
        });
    }
    /**
     * Save new user into db
     * @param userDetails
     */
    saveUser(userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new schema_1.default({
                name: {
                    first: userDetails.firstName,
                    last: userDetails.lastName,
                },
                email: userDetails.email,
                password: userDetails.password,
                mobileNumber: userDetails.mobileNumber,
                type: userDetails.type,
                professional: userDetails.professional
                    ? {
                        bankDetails: {
                            bankAccountNo: userDetails.professional.bankAccountNo,
                            bankIdentityCode: userDetails.professional.bankIdentityCode,
                        },
                        skills: userDetails.professional.skills,
                        serviceTime: {
                            days: userDetails.professional.days,
                            time: {
                                start: userDetails.professional.start,
                                end: userDetails.professional.end,
                            },
                        },
                        serviceArea: userDetails.professional.serviceArea,
                    }
                    : null,
            });
            yield newUser.save().catch((error) => {
                throw error;
            });
            return newUser;
        });
    }
    /**
     * Responsible to save otp and expiry time in db
     */
    saveOtp(id, otp, expiryTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const newOtp = new schema_2.default({
                userId: id,
                otp,
                otpType: model_2.OtpType.Email,
                expiryTime,
            });
            yield newOtp.save().catch((error) => {
                throw error;
            });
        });
    }
    /**
     * Responsible to update otp and expiry time in db
     */
    updateOtp(id, otp, expiryTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield schema_2.default
                .updateOne({ userId: id }, {
                $set: {
                    otp,
                    expiryTime,
                },
            })
                .catch((error) => {
                throw error;
            });
        });
    }
    /**
     * Responsible for updating the fields after otp verification
     * @param id objectId
     */
    verifiedOtp(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // user collection update status
            yield schema_1.default
                .updateOne({ _id: id }, {
                $set: { isVerifiedEmail: true, status: model_1.IUserStatus.notApproved },
            })
                .catch((error) => {
                throw error;
            });
            // otp collection to set null otp and expiry time
            yield schema_2.default
                .updateOne({ userId: id }, {
                $set: { otp: undefined, expiryTime: undefined },
            })
                .catch((error) => {
                throw error;
            });
        });
    }
    getUserDetailsByEmail(email) {
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
            const userDetails = yield schema_1.default.findOne(condition, selection).catch((error) => {
                throw error;
            });
            return userDetails;
        });
    }
    getOtpDetailsByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                userId: id,
            };
            const selection = {
                __v: 0,
            };
            const otpDetails = yield schema_2.default.findOne(condition, selection).catch((error) => {
                console.log(error);
                throw error;
            });
            return otpDetails;
        });
    }
    /**
     * This function is used for creating user token
     * @param userDetails
     */
    genrateUserTokens(userDetails) {
        const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
            ? Number(process.env.ACCESS_TOKEN_EXPIRED)
            : 3600;
        const refreshTokenExpiry = process.env.ACCESS_TOKEN_EXPIRED
            ? Number(process.env.REFRESH_TOKE_EXPIRED)
            : 3600;
        const accessToken = jsonwebtoken_1.default.sign({
            id: userDetails._id,
            name: userDetails.name,
            email: userDetails.email,
            type: userDetails.type,
        }, process.env.USER_ACCESS_TOKEN_SECRET || '', { expiresIn: accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ id: userDetails._id, name: userDetails.name, email: userDetails.email }, process.env.USER_REFRESH_TOKEN_SECRET || '', { expiresIn: refreshTokenExpiry });
        return {
            accessToken: accessToken,
            accessTokenExpiry: accessTokenExpiry,
            refreshToken: refreshToken,
            refreshTokenExpiry: refreshTokenExpiry,
            name: userDetails.name,
            email: userDetails.email,
            _id: userDetails._id,
        };
    }
    /**
     * This function is used for validating user token
     * @param token
     * @param tokenSecret
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verifyUserToken(token, tokenSecret) {
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
     * This function is used for getting the user details by id
     * @param id
     * @param callback
     */
    getUserDetailsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                _id: mongoose_1.default.Types.ObjectId(id),
            };
            const selection = {
                password: 0,
                mobileNumber: 0,
            };
            const userDetails = yield schema_1.default.findOne(condition, selection).catch((error) => {
                throw error;
            });
            return userDetails;
        });
    }
    getUserDetailsForChangePassword(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                _id: id,
            };
            const userDetails = yield schema_1.default.findOne(condition).catch((error) => {
                throw error;
            });
            return userDetails;
        });
    }
    getOtpDetails(otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const condition = {
                otp: otp,
            };
            const userDetails = yield schema_2.default.findOne(condition).catch((error) => {
                throw error;
            });
            return userDetails;
        });
    }
    /**
     * Update user into db
     * @param accessToken
     * @param userDetails
     */
    updateUser(id, reqBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield schema_1.default
                .findByIdAndUpdate(id, {
                'name.first': reqBody.firstName,
                'name.last': reqBody.lastName,
                mobileNumber: reqBody.mobileNumber,
            }, { new: true })
                .catch((error) => {
                throw error;
            });
            return user;
        });
    }
    /**
     * This function is used to update changed password
     * @param userDetails
     */
    resetPassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDetails = yield schema_1.default
                .findByIdAndUpdate(id, { password: password }, { new: true })
                .catch((err) => {
                throw err;
            });
            return userDetails;
        });
    }
    /**
     * Add multiple address into db
     * @param accessToken
     * @param userDetails
     * @param addressRequest
     */
    addAddress(id, userAddresses, reqBody) {
        return __awaiter(this, void 0, void 0, function* () {
            const addresses = userAddresses;
            reqBody.forEach((element) => {
                const address = {
                    address: element.address,
                    citytown: element.citytown,
                    country: element.country,
                    postcode: element.postcode,
                };
                addresses.push({ address: address });
            });
            const user = yield schema_1.default
                .findByIdAndUpdate(id, {
                addresses: addresses,
            }, { new: true })
                .catch((error) => {
                throw error;
            });
            return user;
        });
    }
    /**
     * Update user address into db
     * @param accessToken
     * @param userDetails
     * @param addressRequest
     */
    updateAddress(userId, addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield schema_1.default
                .findByIdAndUpdate(userId, {
                addresses: addresses,
            }, { new: true })
                .catch((error) => {
                throw error;
            });
            return user;
        });
    }
    deleteAddress(userId, addressId, addresses) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedAddresses = addresses.filter((element) => String(element._id) !== addressId);
            const user = yield schema_1.default
                .findByIdAndUpdate(userId, {
                addresses: updatedAddresses,
            }, { new: true })
                .catch((error) => {
                throw error;
            });
            return user;
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=index.js.map
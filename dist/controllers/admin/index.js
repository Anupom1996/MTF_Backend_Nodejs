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
exports.AdminController = void 0;
const admin_1 = require("@services/admin");
const model_1 = require("@modules/admin/model");
const model_2 = require("@modules/users/model");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AdminController {
    constructor() {
        this.adminService = new admin_1.AdminService();
    }
    /**
     * This function is responsible for admin Login
     * @param req email password
     * @param res
     */
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            // get admin details by email
            const adminDetails = yield this.adminService
                .getAdminDetailsByEmail(reqBody.email)
                .catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (adminDetails) {
                // password compare process
                const isSame = yield bcrypt_1.default
                    .compare(reqBody.password, adminDetails.password)
                    .catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (isSame) {
                    // check admin is active
                    if (adminDetails.status === model_1.IAdminStatus.Active) {
                        // genrate token and send responses
                        return res.ok(this.adminService.genrateAdminTokens(adminDetails));
                    }
                }
                else {
                    res.badRequest([res.__('invalidCredentials')]);
                }
            }
            else {
                res.badRequest([res.__('invalidCredentials')]);
            }
        });
    }
    /**
     * This function is admin for genrating new refresh token
     * @param req
     * @param res
     */
    genrateNewToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.adminDetails) {
                res.ok(this.adminService.genrateAdminTokens(req.adminDetails));
            }
            else {
                res.forbidden('unAuthorizedAccess');
            }
        });
    }
    getUserListing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userType = req.params.type;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const condition = {};
            // checking user type
            if (userType == model_2.UserType.customer) {
                condition['type'] = model_2.UserType.customer;
            }
            else if (userType == model_2.UserType.serviceProfessional) {
                condition['type'] = model_2.UserType.serviceProfessional;
            }
            // getting all users in db with filter type
            const allUsers = yield this.adminService.getUsers(condition).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (allUsers) {
                res.ok(allUsers);
            }
            else {
                res.noData();
            }
        });
    }
    profileActivation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            // get user details by id
            const userDetails = yield this.adminService.getUserDetailsById(userId).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (userDetails.status === model_2.IUserStatus.Active) {
                const isInactive = yield this.adminService.updateStatusInactive(userId).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                return res.ok(isInactive);
            }
            else {
                const isActive = yield this.adminService.updateStatusActive(userId).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                return res.ok(isActive);
            }
        });
    }
    //admin Search the UserDetails.............
    getUserSearching(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchText = req.query.searchText || null;
            const type = req.query.type || null;
            const limit = Number(req.query.limit) || 100;
            console.log(limit);
            let condition;
            // checking user type
            if (type == model_2.UserType.customer) {
                //checking type are CUSTOMER or Not
                condition = model_2.UserType.customer;
            }
            else if (type == model_2.UserType.serviceProfessional) {
                //checking type are SERVICE_PROFESSIONAL  or not
                condition = model_2.UserType.serviceProfessional;
            }
            else {
                //here type do not match excat type thatswhy null
                condition = null;
            }
            console.log('this is ', type, 'aaa');
            console.log('this is ', condition, 'aaa');
            if (searchText && type == null) {
                console.log(type);
                if (limit > 0) {
                    const allUsers = yield this.adminService
                        .getUsersData(searchText, condition, limit)
                        .catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    if (allUsers) {
                        res.ok(allUsers);
                    }
                    else {
                        res.noData();
                    }
                }
                else {
                    res.badRequest([res.__('invalidLimitRequest')]);
                }
            }
            else {
                if (limit != null) {
                    if (limit > 0) {
                        //checking type null or not
                        if (condition != null) {
                            const allUsers = yield this.adminService
                                .getUsersData(searchText, condition, limit)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            if (allUsers) {
                                res.ok(allUsers);
                            }
                            else {
                                res.noData();
                            }
                            //if user give the invalid type request
                        }
                        else {
                            console.log('a2');
                            console.log(limit, 'is');
                            res.badRequest([res.__('invalidTypeRequest')]);
                        }
                        // IF user give the invlaid limit (like less than 1)
                    }
                    else {
                        res.badRequest([res.__('invalidLimitRequest')]);
                    }
                }
                else {
                    if (condition != null) {
                        const allUsers = yield this.adminService
                            .getUsersData(searchText, condition, limit)
                            .catch((err) => {
                            res.serverError(err);
                            throw err;
                        });
                        if (allUsers) {
                            res.ok(allUsers);
                        }
                        else {
                            res.noData();
                        }
                        //if user give the invalid type request
                    }
                    else {
                        console.log('a1');
                        res.badRequest([res.__('invalidTypeRequest')]);
                    }
                }
            }
        });
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=index.js.map
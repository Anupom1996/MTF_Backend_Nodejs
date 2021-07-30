"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserType = exports.IUserStatus = void 0;
var IUserStatus;
(function (IUserStatus) {
    IUserStatus["Active"] = "ACTIVE";
    IUserStatus["InActive"] = "INACTIVE";
    IUserStatus["notApproved"] = "NOT_APPROVED";
})(IUserStatus = exports.IUserStatus || (exports.IUserStatus = {}));
var UserType;
(function (UserType) {
    UserType["customer"] = "CUSTOMER";
    UserType["serviceProfessional"] = "SERVICE_PROFESSIONAL";
})(UserType = exports.UserType || (exports.UserType = {}));
//# sourceMappingURL=model.js.map
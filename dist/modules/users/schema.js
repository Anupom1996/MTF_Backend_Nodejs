"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const model_1 = require("./model");
const ProfessionalSchema = new mongoose_1.Schema({
    bankDetails: {
        bankAccountNo: { type: String, required: true, trim: true },
        bankIdentityCode: { type: String, required: true, trim: true },
    },
    skills: [mongoose_1.Schema.Types.ObjectId],
    serviceTime: {
        days: [String],
        time: {
            start: { type: String, trim: true },
            end: { type: String, trim: true },
        },
    },
    serviceArea: [String],
    dbs: {
        isVerified: { type: Boolean, default: true },
    },
});
const UserSchema = new mongoose_1.Schema({
    name: {
        first: { type: String, required: true, trim: true },
        last: { type: String, require: true, trim: true },
    },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    mobileNumber: { type: String },
    addresses: [
        {
            address: {
                address: [String],
                citytown: String,
                country: String,
                postcode: String,
            },
        },
    ],
    status: {
        type: String,
        required: true,
        enum: [model_1.IUserStatus.InActive, model_1.IUserStatus.Active],
        default: model_1.IUserStatus.InActive,
    },
    isVerifiedEmail: { type: Boolean, default: false },
    type: { type: String, required: true, enum: [model_1.UserType.customer, model_1.UserType.serviceProfessional] },
    professional: null || ProfessionalSchema,
}, {
    timestamps: true,
});
// Export the model and return your IUser interface
exports.default = mongoose_1.default.model('userModel', UserSchema, 'users');
//# sourceMappingURL=schema.js.map
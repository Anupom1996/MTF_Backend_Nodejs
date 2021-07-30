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
const JobSchema = new mongoose_1.Schema({
    serviceCategoryId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'serviceModel',
        required: true,
    },
    serviceSubCategoryId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'serviceModel',
        required: true,
    },
    postedBy: { type: mongoose_1.default.Types.ObjectId, ref: 'userModel', required: true },
    location: {
        address: [String],
        citytown: String,
        country: String,
        postcode: String,
    },
    duration: { type: Number, required: true, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    rate: { type: Number, required: true },
    flexibleTime: {
        start: { type: Date, trim: true },
        end: { type: Date, trim: true },
    },
    fixedTime: { type: Date, trim: true },
    contactPersonName: { type: String, trim: true },
    contactPersonNumber: { type: String, trim: true },
    status: {
        type: String,
        required: true,
        enum: [
            model_1.JobStatus.active,
            model_1.JobStatus.payment_initiated,
            model_1.JobStatus.sp_allocated,
            model_1.JobStatus.canceled,
        ],
        default: model_1.JobStatus.active,
    },
    confirmedApplication: { type: mongoose_1.default.Types.ObjectId, ref: 'jobApplyModel' },
}, {
    timestamps: true,
});
// Export the model and return your IJob interface
// here JobSchema: SchemaName   && job :CollectionName
exports.default = mongoose_1.default.model('jobModel', JobSchema, 'job');
//# sourceMappingURL=schema.js.map
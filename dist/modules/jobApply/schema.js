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
const jobApplySchema = new mongoose_1.Schema({
    jobId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'jobModel',
        required: true,
    },
    appliedBy: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'userModel',
        required: true,
    },
    serviceTime: { type: Date, trim: true },
    status: {
        type: String,
        enum: [model_1.JobApplicationStatus.applied, model_1.JobApplicationStatus.approved],
        required: true,
        default: model_1.JobApplicationStatus.applied,
    },
}, {
    timestamps: true,
});
// Export the model and return your IService interface
exports.default = mongoose_1.default.model('jobApplyModel', jobApplySchema, 'jobApply');
//# sourceMappingURL=schema.js.map
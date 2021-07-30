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
exports.JobApplyService = void 0;
const schema_1 = __importDefault(require("@modules/jobApply/schema"));
const model_1 = require("@modules/jobApply/model");
const schema_2 = __importDefault(require("@modules/job/schema"));
class JobApplyService {
    /**
     * Save new Job into db
     * @param services
     */
    saveJobApply(applyJob, userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const newJobApply = new schema_1.default({
                jobId: applyJob.jobId,
                appliedBy: userDetails._id,
                serviceTime: applyJob.serviceTime,
            });
            yield newJobApply.save().catch((error) => {
                throw error;
            });
            return newJobApply;
        });
    }
    // Save job for fixed job
    saveJobApplyForFixedJob(applyJob, userDetails, serviceTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const newJobApply = new schema_1.default({
                jobId: applyJob.jobId,
                appliedBy: userDetails._id,
                serviceTime: serviceTime,
            });
            yield newJobApply.save().catch((error) => {
                throw error;
            });
            return newJobApply;
        });
    }
    // Check job id is valid or not
    validateJobId(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValidJobId = yield schema_2.default
                .findOne({
                _id: jobId,
            }, { flexibleTime: 1, fixedTime: 1, duration: 1, status: 1 })
                .catch((error) => {
                throw error;
            });
            if (isValidJobId) {
                return isValidJobId;
            }
            return null;
        });
    }
    // check job applied only one time or not
    checkAppliedOnce(userId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isApplied = yield schema_1.default
                .findOne({ appliedBy: userId, jobId })
                .catch((error) => {
                throw error;
            });
            return isApplied;
        });
    }
    // Get total jobApplied by service professional
    getTotaljobsByCondition(serviceProfId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Finding total appliedJobs
            const totalJobs = yield schema_1.default
                .countDocuments({ appliedBy: serviceProfId })
                .catch((error) => {
                throw error;
            });
            return totalJobs;
        });
    }
    // Fetch all jobs applied by service professional
    getAppliedJobsByServiceProfessional(serviceProfId, page, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            const selection = {
                updatedAt: 0,
                __v: 0,
            };
            // Fetching paginating applied jobs
            const job = yield schema_1.default
                .find({ appliedBy: serviceProfId }, selection)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .populate({
                path: 'jobId',
                select: {
                    updatedAt: 0,
                    __v: 0,
                },
                populate: {
                    path: 'postedBy',
                    select: {
                        password: 0,
                        isVerifiedEmail: 0,
                        status: 0,
                        addresses: 0,
                        updatedAt: 0,
                        __v: 0,
                    },
                },
            })
                .catch((error) => {
                throw error;
            });
            return job;
        });
    }
    /**
     * get all jobs applied if active
     * @param jobId
     */
    getAppliedJobsById(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appliedJobs = yield schema_1.default
                .find({
                jobId,
                status: {
                    $nin: [
                        model_1.JobApplicationStatus.applicationCanceled,
                        model_1.JobApplicationStatus.jobCanceled,
                        model_1.JobApplicationStatus.rejected,
                    ],
                },
            })
                .sort({ createdAt: -1 })
                .populate({
                path: 'appliedBy',
                select: {
                    status: 0,
                    isVerifiedEmail: 0,
                    isverifiedemail: 0,
                    type: 0,
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            })
                .catch((error) => {
                throw error;
            });
            return appliedJobs;
        });
    }
    /**
     * get all ids of SP's applied jobs
     */
    getAppliedJobIds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appliedJobIds = yield schema_1.default.aggregate([
                { $match: { appliedBy: userId } },
                {
                    $group: {
                        _id: 0,
                        ids: { $push: '$jobId' },
                    },
                },
            ]);
            return appliedJobIds;
        });
    }
    /**
     * change application status
     */
    changeJobApplicationStatus(jobApplyId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobApply = yield schema_1.default
                .findOneAndUpdate({ _id: jobApplyId }, { status: status }, { new: true })
                .populate({
                path: 'appliedBy',
                select: {
                    name: 1,
                    email: 1,
                    mobileNumber: 1,
                    _id: 1,
                },
            })
                .catch((error) => {
                throw error;
            });
            yield schema_1.default.populate(jobApply, {
                path: 'jobId',
            });
            return jobApply;
        });
    }
    // Fetch a job application by its Id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getApplyJob(jobApplyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobApply = yield schema_1.default
                .findById(jobApplyId)
                .populate({
                path: 'appliedBy',
                select: {
                    status: 0,
                    isVerifiedEmail: 0,
                    isverifiedemail: 0,
                    type: 0,
                    password: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                },
            })
                .populate({
                path: 'jobId',
                select: {
                    status: 1,
                    rate: 1,
                },
            })
                .catch((error) => {
                throw error;
            });
            return jobApply;
        });
    }
    // job application status changed to cancel
    jobApplyStatusModify(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield schema_1.default
                .updateMany({ jobId: jobId }, { status: model_1.JobApplicationStatus.jobCanceled })
                .catch((error) => {
                throw error;
            });
        });
    }
    // job application status changed after Job Approved
    jobApplyStatusModifyAfterApproved(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield schema_1.default
                .updateMany({
                jobId: jobId,
                status: {
                    $nin: [model_1.JobApplicationStatus.approved],
                },
            }, { status: model_1.JobApplicationStatus.rejected })
                .catch((error) => {
                throw error;
            });
        });
    }
    /**
     * Cancel job application by changing status
     */
    jobApplyCancel(jobApplyId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield schema_1.default
                .findOneAndUpdate({ _id: jobApplyId }, { status }, { new: true })
                .populate({
                path: 'jobId',
                select: {
                    updatedAt: 0,
                    __v: 0,
                },
                populate: {
                    path: 'postedBy',
                    select: {
                        password: 0,
                        isVerifiedEmail: 0,
                        status: 0,
                        addresses: 0,
                        updatedAt: 0,
                        __v: 0,
                    },
                },
            })
                .catch((error) => {
                throw error;
            });
            return application;
        });
    }
}
exports.JobApplyService = JobApplyService;
//# sourceMappingURL=index.js.map
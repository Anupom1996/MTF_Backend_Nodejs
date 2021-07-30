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
exports.JobService = void 0;
const schema_1 = __importDefault(require("@modules/job/schema"));
const model_1 = require("@modules/job/model");
const mongoose_1 = __importDefault(require("mongoose"));
const model_2 = require("@modules/jobApply/model");
class JobService {
    /**
     * Save new Job into db
     * @param services
     */
    saveJob(jobs, userDetails, rate, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const newJob = new schema_1.default({
                serviceSubCategoryId: jobs.serviceSubCategoryId,
                serviceCategoryId: jobs.serviceCategoryId,
                postedBy: userDetails._id,
                location: {
                    address: jobLocation.address,
                    citytown: jobLocation.citytown,
                    country: jobLocation.country,
                    postcode: jobLocation.postcode,
                },
                flexibleTime: {
                    start: jobs.start ? new Date(jobs.start).toISOString() : null,
                    end: jobs.end ? new Date(jobs.end).toISOString() : null,
                },
                fixedTime: jobs.fixedTime ? new Date(jobs.fixedTime).toISOString() : null,
                duration: jobs.duration,
                description: jobs.description ? jobs.description : null,
                title: jobs.title,
                rate: rate * jobs.duration,
                contactPersonName: jobs.contactPersonName ? jobs.contactPersonName : null,
                contactPersonNumber: jobs.contactPersonNumber ? jobs.contactPersonNumber : null,
            });
            yield newJob.save().catch((error) => {
                throw error;
            });
            return newJob;
        });
    }
    /**
     * get jobs that is available for SP
     * pagination included
     */
    getJobs(appliedJobIds, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield schema_1.default.aggregate([
                { $match: { _id: { $nin: appliedJobIds } } },
                { $match: { status: { $in: [model_1.JobStatus.active] } } },
                {
                    $lookup: {
                        from: 'jobApply',
                        localField: '_id',
                        foreignField: 'jobId',
                        as: 'apply',
                    },
                },
                {
                    $project: {
                        status: 1,
                        location: 1,
                        serviceCategoryId: 1,
                        serviceSubCategoryId: 1,
                        postedBy: 1,
                        flexibleTime: 1,
                        fixedTime: 1,
                        duration: 1,
                        description: 1,
                        title: 1,
                        rate: 1,
                        contactPersonName: 1,
                        contactPersonNumber: 1,
                        createdAt: 1,
                        totalAppliedJobs: {
                            $size: {
                                $filter: {
                                    input: '$apply',
                                    as: 'this',
                                    cond: {
                                        $and: [
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.applicationCanceled] },
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.jobCanceled] },
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.rejected] },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ]);
            return jobs;
        });
    }
    /**
     * get jobs of particular customer
     * pagination included
     * add extra field "totalAppliedJobs" to count total active applications
     */
    getJobByCustomerId(userId, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield schema_1.default.aggregate([
                { $match: { postedBy: mongoose_1.default.Types.ObjectId(userId) } },
                {
                    $lookup: {
                        from: 'jobApply',
                        localField: '_id',
                        foreignField: 'jobId',
                        as: 'apply',
                    },
                },
                {
                    $project: {
                        location: 1,
                        serviceCategoryId: 1,
                        serviceSubCategoryId: 1,
                        postedBy: 1,
                        flexibleTime: 1,
                        fixedTime: 1,
                        duration: 1,
                        description: 1,
                        title: 1,
                        rate: 1,
                        contactPersonName: 1,
                        contactPersonNumber: 1,
                        createdAt: 1,
                        apply: 1,
                        totalAppliedJobs: {
                            $size: {
                                $filter: {
                                    input: '$apply',
                                    as: 'this',
                                    cond: {
                                        $and: [
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.applicationCanceled] },
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.jobCanceled] },
                                            { $ne: ['$$this.status', model_2.JobApplicationStatus.rejected] },
                                        ],
                                    },
                                },
                            },
                        },
                        jobApplication: 1,
                        confirmedApplication: 1,
                        status: 1,
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
            ]);
            yield schema_1.default.populate(jobs, {
                path: 'confirmedApplication',
                populate: {
                    path: 'appliedBy',
                    options: { select: { name: 1, _id: 1, email: 1, mobileNumber: 1 } },
                },
            });
            return jobs;
        });
    }
    // Total Number of jobs Posted By Customer
    countCustomerJobs(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalJobs = yield schema_1.default.countDocuments({ postedBy: userId }).catch((error) => {
                throw error;
            });
            return totalJobs;
        });
    }
    // Total Number of jobs
    countJobs() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalJobs = yield schema_1.default.countDocuments({}).catch((error) => {
                throw error;
            });
            return totalJobs;
        });
    }
    // get particular job details by id
    getJobById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const selection = {
                __v: 0,
            };
            const job = yield schema_1.default
                .findOne({ _id: id }, selection)
                .populate({ path: 'postedBy', select: { name: 1, _id: 1 } })
                .catch((error) => {
                throw error;
            });
            if (job['confirmedApplication']) {
                yield schema_1.default.populate(job, {
                    path: 'confirmedApplication',
                    populate: {
                        path: 'appliedBy',
                        options: { select: { name: 1, _id: 1, email: 1, mobileNumber: 1 } },
                    },
                });
            }
            return job;
        });
    }
    // get particular job details by id
    getJob(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const selection = {
                __v: 0,
            };
            const job = yield schema_1.default.findOne({ _id: id }, selection).catch((error) => {
                throw error;
            });
            return job;
        });
    }
    /**
     * Responsible to change the job status
     * job status change to allocation and set the confirmed application to job collection
     */
    jobApproved(jobId, jobApplyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = yield schema_1.default
                .findOneAndUpdate({ _id: jobId }, { status: model_1.JobStatus.sp_allocated, confirmedApplication: jobApplyId }, { new: true })
                .catch((error) => {
                throw error;
            });
            return job;
        });
    }
    /**
     * change job status for cancellation
     * @param jobId
     * @param jobStatus
     */
    jobStatusModify(jobId, jobStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = yield schema_1.default
                .findOneAndUpdate({ _id: jobId }, { status: jobStatus, confirmedApplication: null }, { new: true })
                .catch((error) => {
                throw error;
            });
            return job;
        });
    }
    /**
     * change job status
     * @param jobId
     * @param jobStatus
     */
    jobStatusChange(jobId, jobStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const job = yield schema_1.default
                .findOneAndUpdate({ _id: jobId }, { status: jobStatus }, { new: true })
                .catch((error) => {
                throw error;
            });
            return job;
        });
    }
}
exports.JobService = JobService;
//# sourceMappingURL=index.js.map
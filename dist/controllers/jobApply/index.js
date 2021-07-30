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
exports.JobApplyTypesController = void 0;
const jobApply_1 = require("@services/jobApply");
const model_1 = require("@modules/jobApply/model");
const model_2 = require("@modules/job/model");
const moment_1 = __importDefault(require("moment"));
const model_3 = require("@modules/users/model");
const mongoose_1 = __importDefault(require("mongoose"));
const job_1 = require("@services/job");
class JobApplyTypesController {
    constructor() {
        this.jobApplyService = new jobApply_1.JobApplyService();
        this.jobService = new job_1.JobService();
    }
    /**
     * Add new job apply
     */
    createJobApply(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            const userType = req.userDetails.type;
            if (userType === model_3.UserType.serviceProfessional) {
                const validateJobId = yield this.jobApplyService.validateJobId(reqBody.jobId).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                // check job id is exist or not
                if (validateJobId) {
                    // apply only if job is active
                    if (validateJobId.status === model_2.JobStatus.active) {
                        // check SP apply for only one time
                        const isAppliedOnce = yield this.jobApplyService
                            .checkAppliedOnce(req.userDetails._id, reqBody.jobId)
                            .catch((err) => {
                            res.serverError(err);
                            throw err;
                        });
                        if (!isAppliedOnce) {
                            // Check for job is flexible or fixed
                            if (validateJobId.flexibleTime.start !== null &&
                                validateJobId.flexibleTime.end !== null) {
                                if (reqBody.serviceTime) {
                                    const serviceTime = moment_1.default(new Date(reqBody.serviceTime)).valueOf();
                                    const startDate = moment_1.default(validateJobId.flexibleTime.start).valueOf();
                                    const endDate = moment_1.default(validateJobId.flexibleTime.end).valueOf();
                                    if (serviceTime > startDate && serviceTime < endDate) {
                                        const newJobApply = yield this.jobApplyService
                                            .saveJobApply(reqBody, req.userDetails)
                                            .catch((err) => {
                                            res.serverError(err);
                                            throw err;
                                        });
                                        if (newJobApply) {
                                            res.created(res.__('jobApplyCreated'));
                                        }
                                        else {
                                            res.badRequest([res.__('jobApplyInsertionFailed')]);
                                        }
                                    }
                                    else {
                                        res.badRequest([res.__('serviceTimeInvalid')]);
                                    }
                                }
                                else {
                                    res.badRequest([res.__('serviceTimeRequired')]);
                                }
                            }
                            else {
                                if (!reqBody.serviceTime) {
                                    const newJobApply = yield this.jobApplyService
                                        .saveJobApplyForFixedJob(reqBody, req.userDetails, validateJobId.fixedTime)
                                        .catch((err) => {
                                        res.serverError(err);
                                        throw err;
                                    });
                                    if (newJobApply) {
                                        res.created(res.__('jobApplyCreated'));
                                    }
                                    else {
                                        res.badRequest([res.__('jobApplyInsertionFailed')]);
                                    }
                                }
                                else {
                                    res.badRequest([res.__('thisIsFixedTimePost')]);
                                }
                            }
                        }
                        else {
                            res.badRequest([res.__('applyOnce')]);
                        }
                    }
                    else {
                        res.badRequest([res.__('jobCanceled')]);
                    }
                }
                else {
                    res.badRequest([res.__('invalidJobId')]);
                }
            }
            else {
                res.badRequest([res.__('mustBeServiceProfessional')]);
            }
        });
    }
    // Get all jobs of current service professional
    getAppliedJobsByServiceProfessional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.userDetails._id;
            const userType = req.userDetails.type;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 100;
            const skip = limit * (page - 1);
            let highestPage;
            if (userType === model_3.UserType.serviceProfessional) {
                // Page number must greater than zero
                if (page <= 0 || limit <= 0) {
                    return res.badRequest([res.__('invalidPageRequest')]);
                }
                // Get total jobs of service professional by condition
                const totalJobsOfServiceProf = yield this.jobApplyService
                    .getTotaljobsByCondition(id)
                    .catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (totalJobsOfServiceProf) {
                    // Error if page request exceed total jobs
                    highestPage = Math.ceil(totalJobsOfServiceProf / limit);
                    if (page > highestPage) {
                        return res.badRequest([res.__('invalidPageRequest')]);
                    }
                }
                else {
                    return res.noData(res.__('noJobFound'));
                }
                // Get all applied jobs by service professional with pagination
                const allJobs = yield this.jobApplyService
                    .getAppliedJobsByServiceProfessional(id, page, limit, skip)
                    .catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (allJobs) {
                    // response body structure
                    const data = {
                        data: allJobs,
                        total: totalJobsOfServiceProf,
                        page: {
                            size: limit,
                            total: highestPage,
                            current: page,
                        },
                    };
                    res.ok(data);
                }
                else {
                    res.noData(res.__('noJobFound'));
                }
            }
            else {
                res.badRequest([res.__('mustBeServiceProfessional')]);
            }
        });
    }
    /**
     * Get all jobs applied by SP by job Id
     * return only active application
     */
    getAppliedJobsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.params.jobId;
            const appliedJobs = yield this.jobApplyService.getAppliedJobsById(jobId).catch((err) => {
                res.serverError(err);
                throw err;
            });
            // job found or not checking
            if (appliedJobs.length >= 1) {
                res.ok(appliedJobs);
            }
            else {
                res.noData();
            }
        });
    }
    getJobApplyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobApplyId = req.params.jobApplyId;
            const jobApply = yield this.jobApplyService
                .getApplyJob(mongoose_1.default.Types.ObjectId(jobApplyId))
                .catch((err) => {
                res.serverError(err);
                throw err;
            });
            res.ok(jobApply);
        });
    }
    /**
     * Responsible for cancel the job application
     * Both customer and SP can cancel application
     * applied => change application status (canceled or rejected)
     * approved => change application status as well as job status
     */
    jobApplicationCancellation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobApplyId = req.body.jobApplyId;
            const userType = req.userDetails.type;
            const jobApply = yield this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
                res.serverError(err);
                throw err;
            });
            // common function responsible for cancel and reject job
            const applicationCancelFunction = () => __awaiter(this, void 0, void 0, function* () {
                let applicationCancel;
                // professional canceled
                if (userType === model_3.UserType.serviceProfessional) {
                    applicationCancel = yield this.jobApplyService
                        .jobApplyCancel(jobApplyId, model_1.JobApplicationStatus.applicationCanceled)
                        .catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    // customer canceled
                }
                else if (userType === model_3.UserType.customer) {
                    applicationCancel = yield this.jobApplyService
                        .jobApplyCancel(jobApplyId, model_1.JobApplicationStatus.rejected)
                        .catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                }
                return applicationCancel;
            });
            if (jobApply) {
                // check if job is not canceled yet
                if (jobApply.jobId.status !== model_2.JobStatus.canceled) {
                    // job must not be in progress
                    if (jobApply.status !== model_1.JobApplicationStatus.workStarted &&
                        jobApply.status !== model_1.JobApplicationStatus.workCompleted) {
                        // SP applied
                        if (jobApply.status === model_1.JobApplicationStatus.applied) {
                            const applicationCancel = yield applicationCancelFunction();
                            if (applicationCancel) {
                                res.ok(applicationCancel);
                            }
                            // SP approved
                        }
                        else if (jobApply.status === model_1.JobApplicationStatus.approved) {
                            const applicationCancel = yield applicationCancelFunction();
                            const job = yield this.jobService
                                .jobStatusModify(jobApply.jobId, model_2.JobStatus.active)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            if (applicationCancel && job) {
                                res.ok(applicationCancel);
                            }
                        }
                        else {
                            res.badRequest([res.__('applicationCanceled')]);
                        }
                    }
                    else {
                        res.badRequest([res.__('jobInProgress')]);
                    }
                }
                else {
                    res.badRequest([res.__('jobCanceled')]);
                }
            }
            else {
                res.badRequest([res.__('jobApplyIdIncorrect')]);
            }
        });
    }
}
exports.JobApplyTypesController = JobApplyTypesController;
//# sourceMappingURL=index.js.map
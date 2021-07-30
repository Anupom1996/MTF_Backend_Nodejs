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
exports.JobTypesController = void 0;
const job_1 = require("@services/job");
const service_1 = require("@services/service");
const model_1 = require("@modules/job/model");
const jobApply_1 = require("@services/jobApply");
const model_2 = require("@modules/users/model");
const mongoose_1 = __importDefault(require("mongoose"));
const model_3 = require("@modules/jobApply/model");
class JobTypesController {
    constructor() {
        this.jobService = new job_1.JobService();
        this.serviceService = new service_1.ServiceService();
        this.jobApplyService = new jobApply_1.JobApplyService();
    }
    /**
     * Add new job
     */
    createJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqBody = req.body;
            const userType = req.userDetails.type;
            let jobLocation = {};
            // Validate service category and sub-category
            if (userType === model_2.UserType.customer) {
                const userAddresses = req.userDetails.addresses;
                let flag = false;
                userAddresses.forEach((address) => {
                    if (address._id == reqBody.location) {
                        flag = true;
                        jobLocation = address.address;
                    }
                });
                if (flag) {
                    const validateService = yield this.serviceService
                        .validateService(reqBody.serviceCategoryId, reqBody.serviceSubCategoryId)
                        .catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    if (validateService) {
                        // job create service called
                        const newJob = yield this.jobService
                            .saveJob(reqBody, req.userDetails, validateService.subCategory[0].rate, jobLocation)
                            .catch((err) => {
                            res.serverError(err);
                            throw err;
                        });
                        // checking for inserted or not
                        if (newJob) {
                            res.created(res.__('jobCreated'));
                        }
                        else {
                            res.badRequest([res.__('insertionFailed')]);
                        }
                    }
                    else {
                        res.badRequest([res.__('invalidServiceId')]);
                    }
                }
                else {
                    res.badRequest([res.__('invalidAddressId')]);
                }
            }
            else {
                res.badRequest([res.__('mustBeCustomer')]);
            }
        });
    }
    /**
     * If Service Professional: Ftech all posted jobs,
     * If Customer: Fecth job posted by that customer
     */
    getJobPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.userDetails._id;
            const userType = req.userDetails.type;
            const pageNumber = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const skip = limit * (pageNumber - 1);
            if (pageNumber > 0 && limit > 0) {
                // Condition for customer
                if (userType === model_2.UserType.customer) {
                    // get all jobs posted by customer
                    const totalJobs = yield this.jobService.countCustomerJobs(userId).catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    if (totalJobs) {
                        // total pages in db
                        const highestPage = Math.ceil(totalJobs / limit);
                        const page = {
                            size: limit,
                            total: highestPage,
                            current: pageNumber,
                        };
                        // page number excced total pages
                        if (pageNumber <= highestPage) {
                            const jobPostByCustomer = yield this.jobService
                                .getJobByCustomerId(userId, limit, skip)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            const resBody = {
                                data: jobPostByCustomer,
                                total: totalJobs,
                                page: page,
                            };
                            res.ok(resBody);
                        }
                        else {
                            res.badRequest([res.__('invalidPageRequest')]);
                        }
                    }
                    else {
                        res.noData(res.__('noJobFound'));
                    }
                }
                else {
                    // total job count for service professional
                    const totalJobs = yield this.jobService.countJobs().catch((err) => {
                        res.serverError(err);
                        throw err;
                    });
                    if (totalJobs) {
                        // total pages in db
                        const highestPage = Math.ceil(totalJobs / limit);
                        const page = {
                            size: limit,
                            total: highestPage,
                            current: pageNumber,
                        };
                        // get SP's applied job ids
                        const appliedJobIds = yield this.jobApplyService.getAppliedJobIds(userId).catch((err) => {
                            res.serverError(err);
                            throw err;
                        });
                        // page number excced total pages
                        if (pageNumber <= highestPage) {
                            const jobPosts = yield this.jobService
                                .getJobs(appliedJobIds.length ? appliedJobIds[0].ids : [], limit, skip)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            const resBody = {
                                data: jobPosts,
                                total: totalJobs,
                                page: page,
                            };
                            res.ok(resBody);
                        }
                        else {
                            res.badRequest([res.__('invalidPageRequest')]);
                        }
                    }
                    else {
                        res.noData(res.__('noJobFound'));
                    }
                }
            }
            else {
                res.badRequest([res.__('invalidPageRequest')]);
            }
        });
    }
    // Get particular job details by jobId
    getJobPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.params.jobId;
            // get job details
            const job = yield this.jobService.getJobById(mongoose_1.default.Types.ObjectId(jobId)).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (job) {
                res.ok(job);
            }
            else {
                res.noData();
            }
        });
    }
    /* Approve Job Application */
    jobApproval(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.body.jobId;
            const jobApplyId = req.body.jobApplyId;
            const job = yield this.jobService.getJobById(mongoose_1.default.Types.ObjectId(jobId)).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (job) {
                const jobApply = yield this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
                    res.serverError(err);
                    throw err;
                });
                if (jobApply) {
                    if (jobApply.status === model_3.JobApplicationStatus.applied) {
                        const currentJob = yield this.jobService.jobApproved(jobId, jobApplyId).catch((err) => {
                            res.serverError(err);
                        });
                        if (currentJob) {
                            const jobApplication = yield this.jobApplyService
                                .changeJobApplicationStatus(jobApplyId, model_3.JobApplicationStatus.approved)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            if (jobApplication) {
                                res.ok(jobApplication);
                            }
                            else {
                                res.badRequest();
                            }
                        }
                        else {
                            res.badRequest();
                        }
                    }
                    else {
                        res.badRequest([res.__('applicationCanceled')]);
                    }
                }
                else {
                    res.noData();
                }
            }
            else {
                res.noData();
            }
        });
    }
    /**
     * Responsible for changing progress status in job and application
     * SP can start and complete the job
     * Customer can complete and finish the job
     */
    jobProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobApplyId = req.body.jobApplyId;
            const status = req.body.status;
            const userType = req.userDetails.type;
            // get job apply details by id
            const jobApply = yield this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (jobApply) {
                // only if job is allocated to SP
                if (jobApply.jobId.status !== model_1.JobStatus.canceled) {
                    // only if application not canceled
                    if (jobApply.status !== model_3.JobApplicationStatus.jobCanceled &&
                        jobApply.status !== model_3.JobApplicationStatus.rejected &&
                        jobApply.status !== model_3.JobApplicationStatus.applicationCanceled) {
                        // if requested status is 'work_started'
                        if (status === model_3.JobApplicationStatus.workStarted) {
                            // user must be SP
                            if (userType === model_2.UserType.serviceProfessional) {
                                // change job status to sp_work_started
                                const job = yield this.jobService
                                    .jobStatusChange(jobApply.jobId._id, model_1.JobStatus.work_started)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                // change application status to work_started
                                const application = yield this.jobApplyService
                                    .changeJobApplicationStatus(jobApplyId, status)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                if (job && application) {
                                    res.ok(application);
                                }
                                else {
                                    res.badRequest();
                                }
                            }
                            else {
                                res.badRequest([res.__('mustBeServiceProfessional')]);
                            }
                            // if requested status is 'work_completed'
                        }
                        else if (status === model_3.JobApplicationStatus.workCompleted) {
                            if (userType === model_2.UserType.serviceProfessional) {
                                // change job status to sp_work_started
                                const job = yield this.jobService
                                    .jobStatusChange(jobApply.jobId._id, model_1.JobStatus.work_completed)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                // change application status to work_completed
                                const application = yield this.jobApplyService
                                    .changeJobApplicationStatus(jobApplyId, status)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                if (job && application) {
                                    res.ok(application);
                                }
                                else {
                                    res.badRequest();
                                }
                            }
                            else {
                                res.badRequest([res.__('mustBeServiceProfessional')]);
                            }
                        }
                        else if (status === model_1.JobStatus.completed) {
                            // user must be customer
                            if (userType === model_2.UserType.customer) {
                                // change job status to completed
                                const job = yield this.jobService
                                    .jobStatusChange(jobApply.jobId._id, model_1.JobStatus.completed)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                // change application status to completed
                                const application = yield this.jobApplyService
                                    .changeJobApplicationStatus(jobApplyId, status)
                                    .catch((err) => {
                                    res.serverError(err);
                                    throw err;
                                });
                                if (job && application) {
                                    res.ok(job);
                                }
                                else {
                                    res.badRequest();
                                }
                            }
                            else {
                                res.badRequest([res.__('mustBeCustomer')]);
                            }
                        }
                        else {
                            res.badRequest([res.__('invalidStatus')]);
                        }
                    }
                    else {
                        res.badRequest([res.__('applicationCanceled')]);
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
    // Responsible for cancel the job and change status
    jobCancellation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.body.jobId;
            // get job details by id
            const job = yield this.jobService.getJob(jobId).catch((err) => {
                res.serverError(err);
            });
            if (job) {
                // Job must not canceled yet
                if (job.status !== model_1.JobStatus.canceled) {
                    // Job must not started yet
                    if (job.status !== model_1.JobStatus.work_started && job.status !== model_1.JobStatus.work_completed) {
                        // only situations when job can be cancel
                        if (job.status === model_1.JobStatus.active ||
                            job.status === model_1.JobStatus.sp_allocated ||
                            job.status === model_1.JobStatus.payment_initiated) {
                            const jobCanceled = yield this.jobService
                                .jobStatusModify(jobId, model_1.JobStatus.canceled)
                                .catch((err) => {
                                res.serverError(err);
                                throw err;
                            });
                            yield this.jobApplyService.jobApplyStatusModify(jobId).catch((err) => {
                                res.serverError(err);
                            });
                            if (jobCanceled) {
                                res.ok(jobCanceled);
                            }
                        }
                        else {
                            res.badRequest([res.__('')]);
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
                res.badRequest([res.__('jobIdIncorrect')]);
            }
        });
    }
}
exports.JobTypesController = JobTypesController;
//# sourceMappingURL=index.js.map
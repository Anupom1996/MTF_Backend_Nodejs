"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplyRouter = void 0;
const express_1 = require("express");
const jobApply_1 = require("@controllers/jobApply");
const index_1 = require("@middleware/index");
const jobApply_2 = require("@validations/jobApply");
const index_2 = require("@validations/index");
const jobApplyRouter = express_1.Router();
exports.jobApplyRouter = jobApplyRouter;
const jobApplyCtrl = new jobApply_1.JobApplyTypesController();
// Router for Job Create
jobApplyRouter.post('/applications', index_1.validateApiKey, index_1.validateUserAccessToken, jobApply_2.validateSaveJobApplyRequest, index_2.validate, (req, res) => jobApplyCtrl.createJobApply(req, res));
// Router for get jobs of current service professional
jobApplyRouter.get('/applications', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => jobApplyCtrl.getAppliedJobsByServiceProfessional(req, res));
// Router for get jobs of current service professional
jobApplyRouter.get('/applications/:jobId', index_1.validateApiKey, index_1.validateUserAccessToken, jobApply_2.validateParam, index_2.validate, (req, res) => jobApplyCtrl.getAppliedJobsById(req, res));
jobApplyRouter.get('/applications/job-apply/:jobApplyId', index_1.validateApiKey, index_1.validateUserAccessToken, jobApply_2.validateJobApplyIdParam, index_2.validate, (req, res) => jobApplyCtrl.getJobApplyById(req, res));
jobApplyRouter.put('/job-application-cancel', index_1.validateApiKey, index_1.validateUserAccessToken, jobApply_2.validateJobApplyCancelRequest, index_2.validate, (req, res) => jobApplyCtrl.jobApplicationCancellation(req, res));
//# sourceMappingURL=index.js.map
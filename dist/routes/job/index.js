"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = require("express");
const job_1 = require("@controllers/job");
const index_1 = require("@middleware/index");
const job_2 = require("@validations/job");
const index_2 = require("@validations/index");
const payment_1 = require("@controllers/payment");
const payment_2 = require("@validations/payment");
const jobRouter = express_1.Router();
exports.jobRouter = jobRouter;
const jobCtrl = new job_1.JobTypesController();
const paymentCtrl = new payment_1.PaymentController();
//Router for Job Create
jobRouter.post('', index_1.validateApiKey, index_1.validateUserAccessToken, job_2.validateSaveJobRequest, index_2.validate, (req, res) => jobCtrl.createJob(req, res));
//Router for get the job post based on user type
jobRouter.get('/jobs', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => jobCtrl.getJobPosts(req, res));
//Router for get the job details by jobId
jobRouter.get('/jobs/:jobId', index_1.validateApiKey, index_1.validateUserAccessToken, job_2.validateGetJobByIdRequest, index_2.validate, (req, res) => jobCtrl.getJobPostById(req, res));
//Router for approve job application
jobRouter.put('/job-approval', index_1.validateApiKey, index_1.validateUserAccessToken, job_2.validateJobApprovalRequest, index_2.validate, (req, res) => jobCtrl.jobApproval(req, res));
jobRouter.put('/job-progress', index_1.validateApiKey, index_1.validateUserAccessToken, (req, res) => jobCtrl.jobProgress(req, res));
//Router for approve job application
jobRouter.put('/job-cancel', index_1.validateApiKey, index_1.validateUserAccessToken, job_2.validateJobCancelRequest, index_2.validate, (req, res) => jobCtrl.jobCancellation(req, res));
jobRouter.post('/payment', index_1.validateApiKey, index_1.validateUserAccessToken, payment_2.validateJobPaymentRequest, index_2.validate, (req, res) => paymentCtrl.payment(req, res));
// jobRouter.post(
//   './webhook',
//   bodyParser.raw({ type: 'application/json' }),
//   (req: Request, res: Response) => paymentCtrl.webhookController(req, res),
// );
jobRouter.get('/payments/:jobId', index_1.validateApiKey, index_1.validateUserAccessToken, job_2.validateGetJobByIdRequest, index_2.validate, (req, res) => paymentCtrl.payments(req, res));
//# sourceMappingURL=index.js.map
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
exports.PaymentController = void 0;
const job_1 = require("@services/job");
const jobApply_1 = require("@services/jobApply");
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_1 = __importDefault(require("stripe"));
const model_1 = require("@modules/jobApply/model");
const payment_1 = require("@services/payment");
const model_2 = require("@modules/job/model");
const secretKey = process.env.SECRET_KEY || '';
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET || '';
const stripe = new stripe_1.default(secretKey, { apiVersion: '2020-08-27' });
class PaymentController {
    constructor() {
        this.jobService = new job_1.JobService();
        this.jobApplyService = new jobApply_1.JobApplyService();
        this.paymentService = new payment_1.PaymentService();
    }
    payment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.body.jobId;
            const jobApplicationId = req.body.jobApplyId;
            const job = yield this.jobService.getJobById(mongoose_1.default.Types.ObjectId(jobId)).catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (job) {
                const customerId = job.postedBy._id.toString();
                const customerName = job.postedBy.name.first + ' ' + job.postedBy.name.last;
                const jobApply = yield this.jobApplyService.getApplyJob(jobApplicationId).catch((err) => {
                    res.serverError(err);
                });
                if (jobApply) {
                    const serviceProfessionalId = jobApply.appliedBy._id.toString();
                    const serviceProfessionalName = jobApply.appliedBy.name.first + ' ' + jobApply.appliedBy.name.last;
                    const paymentIntent = yield stripe.paymentIntents
                        .create({
                        amount: parseInt(jobApply.jobId.rate) * 100,
                        currency: 'gbp',
                        metadata: {
                            jobId,
                            jobApplicationId,
                            customerName,
                            customerId,
                            serviceProfessionalName,
                            serviceProfessionalId,
                        },
                    })
                        .catch((err) => {
                        console.log(err);
                        return res.badRequest([res.__(err)]);
                    });
                    if (paymentIntent.id) {
                        yield this.jobService.jobStatusModify(jobId, model_2.JobStatus.payment_initiated).catch((err) => {
                            res.serverError(err);
                            throw err;
                        });
                        res.send({ data: paymentIntent });
                    }
                    else {
                        res.status(500).send('server error');
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
    webhookController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const sig = req.headers['stripe-signature'] || '';
            let event = null;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            }
            catch (err) {
                console.log(err);
                res.status(400).end();
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let intent = null;
            if (event.data.object) {
                intent = event.data.object;
                yield this.paymentService
                    .saveJobPayment(intent)
                    .then((res) => {
                    console.log(res);
                })
                    .catch((err) => {
                    console.log(err);
                });
            }
            switch (event['type']) {
                case 'payment_intent.succeeded':
                    intent = event.data.object;
                    // await this.paymentService
                    //   .saveJobPayment(intent)
                    //   .then((res) => {
                    //     console.log(res);
                    //   })
                    //   .catch((err) => {
                    //     console.log(err);
                    //   });
                    yield this.jobService
                        .jobApproved(intent.metadata.jobId, intent.metadata.jobApplicationId)
                        .catch((err) => {
                        console.log(1);
                        throw err;
                    })
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        .then((currentJob) => __awaiter(this, void 0, void 0, function* () {
                        yield this.jobApplyService
                            .changeJobApplicationStatus(intent.metadata.jobApplicationId, model_1.JobApplicationStatus.approved)
                            .catch((err) => {
                            console.log(err);
                        })
                            .then((jobApplication) => __awaiter(this, void 0, void 0, function* () {
                            console.log(jobApplication);
                            yield this.jobApplyService.jobApplyStatusModifyAfterApproved(intent.metadata.jobId);
                        }));
                    }));
                    console.log('Payment intent succeeded:', intent);
                    break;
                case 'payment_intent.payment_failed':
                    intent = event.data.object;
                    console.log('payment failed');
                    yield this.jobService
                        .jobStatusModify(intent.metadata.jobId, model_2.JobStatus.active)
                        .then((job) => console.log(job))
                        .catch((err) => console.log(err));
                    break;
                default:
                    intent = event.data.object;
                    console.log('Failed:', intent);
                    break;
            }
            res.sendStatus(200);
        });
    }
    payments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobId = req.params.jobId;
            yield this.paymentService
                .getPaymentInfo(mongoose_1.default.Types.ObjectId(jobId))
                .catch((err) => {
                res.badRequest([res.__(err)]);
            })
                .then((result) => res.ok(result));
        });
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=index.js.map
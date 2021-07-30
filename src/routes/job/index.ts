import { Router, Request, Response } from 'express';
import { JobTypesController } from '@controllers/job';
import { validateApiKey, validateUserAccessToken } from '@middleware/index';
import {
  validateSaveJobRequest,
  validateGetJobByIdRequest,
  validateJobApprovalRequest,
  validateJobCancelRequest,
} from '@validations/job';
import { validate } from '@validations/index';
import { PaymentController } from '@controllers/payment';
import { validateJobPaymentRequest } from '@validations/payment';

const jobRouter = Router();
const jobCtrl = new JobTypesController();
const paymentCtrl = new PaymentController();

//Router for Job Create
jobRouter.post(
  '',
  validateApiKey,
  validateUserAccessToken,
  validateSaveJobRequest,
  validate,
  (req: Request, res: Response) => jobCtrl.createJob(req, res),
);

//Router for get the job post based on user type
jobRouter.get('/jobs', validateApiKey, validateUserAccessToken, (req: Request, res: Response) =>
  jobCtrl.getJobPosts(req, res),
);

//Router for get the job details by jobId
jobRouter.get(
  '/jobs/:jobId',
  validateApiKey,
  validateUserAccessToken,
  validateGetJobByIdRequest,
  validate,
  (req: Request, res: Response) => jobCtrl.getJobPostById(req, res),
);

//Router for approve job application
jobRouter.put(
  '/job-approval',
  validateApiKey,
  validateUserAccessToken,
  validateJobApprovalRequest,
  validate,
  (req: Request, res: Response) => jobCtrl.jobApproval(req, res),
);

jobRouter.put(
  '/job-progress',
  validateApiKey,
  validateUserAccessToken,
  (req: Request, res: Response) => jobCtrl.jobProgress(req, res),
);

//Router for approve job application
jobRouter.put(
  '/job-cancel',
  validateApiKey,
  validateUserAccessToken,
  validateJobCancelRequest,
  validate,
  (req: Request, res: Response) => jobCtrl.jobCancellation(req, res),
);

jobRouter.post(
  '/payment',
  validateApiKey,
  validateUserAccessToken,
  validateJobPaymentRequest,
  validate,
  (req: Request, res: Response) => paymentCtrl.payment(req, res),
);

// jobRouter.post(
//   './webhook',
//   bodyParser.raw({ type: 'application/json' }),
//   (req: Request, res: Response) => paymentCtrl.webhookController(req, res),
// );

jobRouter.get(
  '/payments/:jobId',
  validateApiKey,
  validateUserAccessToken,
  validateGetJobByIdRequest,
  validate,
  (req: Request, res: Response) => paymentCtrl.payments(req, res),
);
export { jobRouter };

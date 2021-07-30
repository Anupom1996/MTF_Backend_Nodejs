import { Router, Request, Response } from 'express';
import { JobApplyTypesController } from '@controllers/jobApply';
import { validateApiKey, validateUserAccessToken } from '@middleware/index';
import {
  validateSaveJobApplyRequest,
  validateParam,
  validateJobApplyIdParam,
  validateJobApplyCancelRequest,
} from '@validations/jobApply';
import { validate } from '@validations/index';

const jobApplyRouter = Router();
const jobApplyCtrl = new JobApplyTypesController();

// Router for Job Create
jobApplyRouter.post(
  '/applications',
  validateApiKey,
  validateUserAccessToken,
  validateSaveJobApplyRequest,
  validate,
  (req: Request, res: Response) => jobApplyCtrl.createJobApply(req, res),
);

// Router for get jobs of current service professional
jobApplyRouter.get(
  '/applications',
  validateApiKey,
  validateUserAccessToken,
  (req: Request, res: Response) => jobApplyCtrl.getAppliedJobsByServiceProfessional(req, res),
);

// Router for get jobs of current service professional
jobApplyRouter.get(
  '/applications/:jobId',
  validateApiKey,
  validateUserAccessToken,
  validateParam,
  validate,
  (req: Request, res: Response) => jobApplyCtrl.getAppliedJobsById(req, res),
);

jobApplyRouter.get(
  '/applications/job-apply/:jobApplyId',
  validateApiKey,
  validateUserAccessToken,
  validateJobApplyIdParam,
  validate,
  (req: Request, res: Response) => jobApplyCtrl.getJobApplyById(req, res),
);

jobApplyRouter.put(
  '/job-application-cancel',
  validateApiKey,
  validateUserAccessToken,
  validateJobApplyCancelRequest,
  validate,
  (req: Request, res: Response) => jobApplyCtrl.jobApplicationCancellation(req, res),
);

export { jobApplyRouter };

import { Router, Request, Response } from 'express';
import { AdminController } from '@controllers/admin';
import {
  validateApiKey,
  validateAdminAccessToken,
  validateAdminRefreshToken,
} from '@middleware/index';
import { validateAdminLoginRequest } from '@validations/admin';
import { validate } from '@validations/index';

const adminRouter = Router();
const adminCtrl = new AdminController();

adminRouter.post(
  '/login',
  validateApiKey,
  validateAdminLoginRequest,
  validate,
  (req: Request, res: Response) => adminCtrl.adminLogin(req, res),
);

adminRouter.get(
  '/token',
  validateApiKey,
  validateAdminRefreshToken,
  (req: Request, res: Response) => adminCtrl.genrateNewToken(req, res),
);

adminRouter.get(
  '/user-list/:type',
  validateApiKey,
  validateAdminAccessToken,
  (req: Request, res: Response) => adminCtrl.getUserListing(req, res),
);
adminRouter.get(
  '/user-active-deactive/:id',
  validateApiKey,
  validateAdminAccessToken,
  (req: Request, res: Response) => adminCtrl.profileActivation(req, res),
);
adminRouter.get(
  '/search-user',
  validateApiKey,
  validateAdminAccessToken,
  (req: Request, res: Response) => adminCtrl.getUserSearching(req, res),
);
export { adminRouter };

import { Router, Request, Response } from 'express';
import { ServiceController } from '@controllers/service';
import { validateApiKey } from '@middleware/index';

const serviceRouter = Router();
const serviceCtrl = new ServiceController();

serviceRouter.get('', validateApiKey, (req: Request, res: Response) =>
  serviceCtrl.getServices(req, res),
);

export { serviceRouter };

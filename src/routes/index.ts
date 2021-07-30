import { Router } from 'express';
import { userRouter } from './user';
import { jobApplyRouter } from './jobApply';
import { jobRouter } from './job';
import { adminRouter } from './admin';
import { serviceRouter } from './service';

const v1Router = Router();

v1Router.use('/user', userRouter);
v1Router.use('/job', jobRouter);
v1Router.use('/job', jobApplyRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/service', serviceRouter);
// All routes go here

export { v1Router };

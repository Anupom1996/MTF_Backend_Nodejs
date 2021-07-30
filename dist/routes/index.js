"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v1Router = void 0;
const express_1 = require("express");
const user_1 = require("./user");
const jobApply_1 = require("./jobApply");
const job_1 = require("./job");
const admin_1 = require("./admin");
const service_1 = require("./service");
const v1Router = express_1.Router();
exports.v1Router = v1Router;
v1Router.use('/user', user_1.userRouter);
v1Router.use('/job', job_1.jobRouter);
v1Router.use('/job', jobApply_1.jobApplyRouter);
v1Router.use('/admin', admin_1.adminRouter);
v1Router.use('/service', service_1.serviceRouter);
//# sourceMappingURL=index.js.map
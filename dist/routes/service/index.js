"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const express_1 = require("express");
const service_1 = require("@controllers/service");
const index_1 = require("@middleware/index");
const serviceRouter = express_1.Router();
exports.serviceRouter = serviceRouter;
const serviceCtrl = new service_1.ServiceController();
serviceRouter.get('', index_1.validateApiKey, (req, res) => serviceCtrl.getServices(req, res));
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_1 = require("@controllers/admin");
const index_1 = require("@middleware/index");
const admin_2 = require("@validations/admin");
const index_2 = require("@validations/index");
const adminRouter = express_1.Router();
exports.adminRouter = adminRouter;
const adminCtrl = new admin_1.AdminController();
adminRouter.post('/login', index_1.validateApiKey, admin_2.validateAdminLoginRequest, index_2.validate, (req, res) => adminCtrl.adminLogin(req, res));
adminRouter.get('/token', index_1.validateApiKey, index_1.validateAdminRefreshToken, (req, res) => adminCtrl.genrateNewToken(req, res));
adminRouter.get('/user-list/:type', index_1.validateApiKey, index_1.validateAdminAccessToken, (req, res) => adminCtrl.getUserListing(req, res));
adminRouter.get('/user-active-deactive/:id', index_1.validateApiKey, index_1.validateAdminAccessToken, (req, res) => adminCtrl.profileActivation(req, res));
adminRouter.get('/search-user', index_1.validateApiKey, index_1.validateAdminAccessToken, (req, res) => adminCtrl.getUserSearching(req, res));
//# sourceMappingURL=index.js.map
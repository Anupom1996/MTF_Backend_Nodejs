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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceController = void 0;
const service_1 = require("@services/service");
class ServiceController {
    constructor() {
        this.serviceService = new service_1.ServiceService();
    }
    /**
     * get all the sub categories of service
     * @param req
     * @param res
     */
    getServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //getting all the sub categories
            const subCategories = yield this.serviceService.getServices().catch((err) => {
                res.serverError(err);
                throw err;
            });
            if (subCategories) {
                res.ok(subCategories);
            }
            else {
                res.noData();
            }
        });
    }
}
exports.ServiceController = ServiceController;
//# sourceMappingURL=index.js.map
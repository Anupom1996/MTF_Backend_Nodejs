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
exports.ServiceService = void 0;
const schema_1 = __importDefault(require("@modules/service/schema"));
const schema_2 = __importDefault(require("@modules/serviceArea/schema"));
class ServiceService {
    // Responsible for validate category and subcategory is exist
    // return service details if exist
    validateService(categoryId, subCategoryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const subCategoryRate = yield schema_1.default
                .findOne({
                _id: categoryId,
                'subCategory._id': subCategoryId,
            }, { 'subCategory.rate': 1 })
                .catch((error) => {
                console.log(error);
                throw error;
            });
            if (!subCategoryRate) {
                return null;
            }
            return subCategoryRate;
        });
    }
    // Insert service areas in db if unique
    saveUniqueServiceArea(areas) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = [];
            let postcodes = [];
            postcodes = yield schema_2.default.distinct('postcode').catch((error) => {
                throw error;
            });
            for (const area of areas) {
                if (!postcodes.includes(area)) {
                    data.push({ postcode: area });
                }
            }
            console.log(data);
            yield schema_2.default.insertMany(data).catch((error) => {
                throw error;
            });
        });
    }
    // get all service sub-categories
    getServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const selection = {
                __v: 0,
            };
            const subcats = yield schema_1.default.find({}, selection).catch((error) => {
                throw error;
            });
            return subcats;
        });
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=index.js.map
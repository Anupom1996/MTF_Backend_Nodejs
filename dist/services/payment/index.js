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
exports.PaymentService = void 0;
const schema_1 = __importDefault(require("@modules/payment_info/schema"));
class PaymentService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveJobPayment(paymentInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = new schema_1.default(paymentInfo);
            yield payment.save().catch((error) => {
                throw error;
            });
            return payment;
        });
    }
    //Get all Payment Info associated with a jobId
    getPaymentInfo(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payments = yield schema_1.default
                .find({ 'metadata.jobId': jobId.toString() })
                .sort({ createdAt: -1 })
                .catch((error) => {
                throw error;
            });
            return payments;
        });
    }
}
exports.PaymentService = PaymentService;
//'charges.data[metadata].jobId': jobId
//# sourceMappingURL=index.js.map
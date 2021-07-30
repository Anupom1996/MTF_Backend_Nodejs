import paymentInfoModel from '@modules/payment_info/schema';
import mongoose, { Types } from 'mongoose';

export class PaymentService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async saveJobPayment(paymentInfo: any) {
    const payment = new paymentInfoModel(paymentInfo);
    await payment.save().catch((error: Error) => {
      throw error;
    });
    return payment;
  }

  //Get all Payment Info associated with a jobId
  public async getPaymentInfo(jobId: mongoose.Types.ObjectId) {
    const payments = await paymentInfoModel
      .find({ 'metadata.jobId': jobId.toString() })
      .sort({ createdAt: -1 })
      .catch((error: Error) => {
        throw error;
      });
    return payments;
  }
}

//'charges.data[metadata].jobId': jobId

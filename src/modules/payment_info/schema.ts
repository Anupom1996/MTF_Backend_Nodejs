import mongoose, { Schema } from 'mongoose';

const paymentInfoSchema: Schema = new Schema({}, { strict: false, timestamps: true });

export default mongoose.model('paymentInfoModel', paymentInfoSchema, 'payment_info');

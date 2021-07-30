import mongoose, { Schema } from 'mongoose';
import { IJob, JobStatus } from './model';

const JobSchema: Schema = new Schema(
  {
    serviceCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: 'serviceModel',
      required: true,
    },
    serviceSubCategoryId: {
      type: mongoose.Types.ObjectId,
      ref: 'serviceModel',
      required: true,
    },
    postedBy: { type: mongoose.Types.ObjectId, ref: 'userModel', required: true },
    location: {
      address: [String],
      citytown: String,
      country: String,
      postcode: String,
    },
    duration: { type: Number, required: true, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    rate: { type: Number, required: true },
    flexibleTime: {
      start: { type: Date, trim: true },
      end: { type: Date, trim: true },
    },
    fixedTime: { type: Date, trim: true },
    contactPersonName: { type: String, trim: true },
    contactPersonNumber: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      enum: [
        JobStatus.active,
        JobStatus.payment_initiated,
        JobStatus.sp_allocated,
        JobStatus.canceled,
      ],
      default: JobStatus.active,
    },
    confirmedApplication: { type: mongoose.Types.ObjectId, ref: 'jobApplyModel' },
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IJob interface
// here JobSchema: SchemaName   && job :CollectionName
export default mongoose.model<IJob>('jobModel', JobSchema, 'job');

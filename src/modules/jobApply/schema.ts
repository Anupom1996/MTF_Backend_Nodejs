import mongoose, { Schema } from 'mongoose';
import { IJobApply, JobApplicationStatus } from './model';

const jobApplySchema: Schema = new Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: 'jobModel',
      required: true,
    },
    appliedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
    serviceTime: { type: Date, trim: true },
    status: {
      type: String,
      enum: [JobApplicationStatus.applied, JobApplicationStatus.approved],
      required: true,
      default: JobApplicationStatus.applied,
    },
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IService interface
export default mongoose.model<IJobApply>('jobApplyModel', jobApplySchema, 'jobApply');

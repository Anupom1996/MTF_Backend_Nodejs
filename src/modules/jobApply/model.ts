import { Document, Types } from 'mongoose';

export enum JobApplicationStatus {
  applied = 'APPLIED',
  approved = 'APPROVED',
  workStarted = 'WORK_STARTED',
  workCompleted = 'WORK_COMPLETED',
  completed = 'COMPLETED',
  jobCanceled = 'JOB_CANCELED',
  applicationCanceled = 'APPLICATION_CANCELED',
  rejected = 'REJECTED',
}

export interface IJobApply extends Document {
  jobId: Types.ObjectId;
  appliedBy: Types.ObjectId;
  serviceTime: Date;
  status: JobApplicationStatus;
}

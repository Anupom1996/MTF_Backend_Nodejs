import { Document, Types } from 'mongoose';
import { IUser } from '@modules/users/model';

export enum JobStatus {
  active = 'ACTIVE',
  payment_initiated = 'PAYMENT_INITIATED',
  sp_allocated = 'SP_ALLOCATED',
  work_started = 'SP_WORK_STARTED',
  work_completed = 'SP_WORK_COMPLETED',
  canceled = 'CANCELED',
  completed = 'COMPLETED',
}

export interface IJobFlexableDate {
  start: Date;
  end: Date;
}
export interface IJob extends Document {
  serviceSubCategoryId: Types.ObjectId;
  serviceCategoryId: Types.ObjectId;
  location: IAddressModel;
  postedBy: Types.ObjectId;
  flexibleTime: IJobFlexableDate;
  fixedTime: string;
  description: string;
  title: string;
  duration: number;
  rate: number;
  contactPersonName: string;
  contactPersonNumber: string;
  status: JobStatus;
  confirmedApplication: Types.ObjectId | null;
}

export interface IAddressModel extends Document {
  address: Array<string>;
  citytown: string;
  country: string;
  postcode: string;
}

export interface ICreateJob {
  serviceSubCategoryId: Types.ObjectId;
  serviceCategoryId: Types.ObjectId;
  location: Types.ObjectId;
  start: Date;
  end: Date;
  fixedTime: string;
  description: string;
  title: string;
  duration: number;
  rate: number;
  contactPersonName: string;
  contactPersonNumber: string;
  status: JobStatus;
  confirmedApplication: Types.ObjectId;
}

export interface IGetJob {
  postedBy: IUser;
  serviceSubCategoryId: Types.ObjectId;
  serviceCategoryId: Types.ObjectId;
  location: Types.ObjectId;
  start: Date;
  end: Date;
  fixedTime: string;
  description: string;
  title: string;
  duration: number;
  rate: number;
  contactPersonName: string;
  contactPersonNumber: string;
  status: JobStatus;
  confirmedApplication: Types.ObjectId;
}

export interface IAppliedJobIds {
  id: number;
  ids: Array<Types.ObjectId>;
}

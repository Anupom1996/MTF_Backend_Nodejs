import jobModel from '@modules/job/schema';
import { ICreateJob, IJob, JobStatus, IGetJob } from '@modules/job/model';

import { IUser, IJobResponse } from '@modules/users/model';
import mongoose, { Types } from 'mongoose';
import { JobApplicationStatus } from '@modules/jobApply/model';

export class JobService {
  /**
   * Save new Job into db
   * @param services
   */
  public async saveJob(
    jobs: ICreateJob,
    userDetails: IUser,
    rate: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jobLocation: any,
  ): Promise<IJob | null> {
    const newJob = new jobModel({
      serviceSubCategoryId: jobs.serviceSubCategoryId,
      serviceCategoryId: jobs.serviceCategoryId,
      postedBy: userDetails._id,
      location: {
        address: jobLocation.address,
        citytown: jobLocation.citytown,
        country: jobLocation.country,
        postcode: jobLocation.postcode,
      },
      flexibleTime: {
        start: jobs.start ? new Date(jobs.start).toISOString() : null,
        end: jobs.end ? new Date(jobs.end).toISOString() : null,
      },
      fixedTime: jobs.fixedTime ? new Date(jobs.fixedTime).toISOString() : null,
      duration: jobs.duration,
      description: jobs.description ? jobs.description : null,
      title: jobs.title,
      rate: rate * jobs.duration,
      contactPersonName: jobs.contactPersonName ? jobs.contactPersonName : null,
      contactPersonNumber: jobs.contactPersonNumber ? jobs.contactPersonNumber : null,
    });

    await newJob.save().catch((error: Error) => {
      throw error;
    });

    return newJob;
  }

  /**
   * get jobs that is available for SP
   * pagination included
   */
  public async getJobs(
    appliedJobIds: Array<Types.ObjectId>,
    limit: number,
    skip: number,
  ): Promise<IJobResponse[] | null> {
    const jobs = await jobModel.aggregate([
      { $match: { _id: { $nin: appliedJobIds } } },
      { $match: { status: { $in: [JobStatus.active] } } },
      {
        $lookup: {
          from: 'jobApply',
          localField: '_id',
          foreignField: 'jobId',
          as: 'apply',
        },
      },
      {
        $project: {
          status: 1,
          location: 1,
          serviceCategoryId: 1,
          serviceSubCategoryId: 1,
          postedBy: 1,
          flexibleTime: 1,
          fixedTime: 1,
          duration: 1,
          description: 1,
          title: 1,
          rate: 1,
          contactPersonName: 1,
          contactPersonNumber: 1,
          createdAt: 1,
          totalAppliedJobs: {
            $size: {
              $filter: {
                input: '$apply',
                as: 'this',
                cond: {
                  $and: [
                    { $ne: ['$$this.status', JobApplicationStatus.applicationCanceled] },
                    { $ne: ['$$this.status', JobApplicationStatus.jobCanceled] },
                    { $ne: ['$$this.status', JobApplicationStatus.rejected] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return jobs;
  }

  /**
   * get jobs of particular customer
   * pagination included
   * add extra field "totalAppliedJobs" to count total active applications
   */
  public async getJobByCustomerId(
    userId: string,
    limit: number,
    skip: number,
  ): Promise<IJob[] | null> {
    const jobs = await jobModel.aggregate([
      { $match: { postedBy: mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'jobApply',
          localField: '_id',
          foreignField: 'jobId',
          as: 'apply',
        },
      },
      {
        $project: {
          location: 1,
          serviceCategoryId: 1,
          serviceSubCategoryId: 1,
          postedBy: 1,
          flexibleTime: 1,
          fixedTime: 1,
          duration: 1,
          description: 1,
          title: 1,
          rate: 1,
          contactPersonName: 1,
          contactPersonNumber: 1,
          createdAt: 1,
          apply: 1,
          totalAppliedJobs: {
            $size: {
              $filter: {
                input: '$apply',
                as: 'this',
                cond: {
                  $and: [
                    { $ne: ['$$this.status', JobApplicationStatus.applicationCanceled] },
                    { $ne: ['$$this.status', JobApplicationStatus.jobCanceled] },
                    { $ne: ['$$this.status', JobApplicationStatus.rejected] },
                  ],
                },
              },
            },
          },
          jobApplication: 1,
          confirmedApplication: 1,
          status: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    await jobModel.populate(jobs, {
      path: 'confirmedApplication',
      populate: {
        path: 'appliedBy',
        options: { select: { name: 1, _id: 1, email: 1, mobileNumber: 1 } },
      },
    });
    return jobs;
  }

  // Total Number of jobs Posted By Customer
  public async countCustomerJobs(userId: string): Promise<number | null> {
    const totalJobs = await jobModel.countDocuments({ postedBy: userId }).catch((error: Error) => {
      throw error;
    });
    return totalJobs;
  }

  // Total Number of jobs
  public async countJobs(): Promise<number | null> {
    const totalJobs = await jobModel.countDocuments({}).catch((error: Error) => {
      throw error;
    });
    return totalJobs;
  }

  // get particular job details by id
  public async getJobById(id: mongoose.Types.ObjectId): Promise<IGetJob | null> {
    const selection = {
      __v: 0,
    };
    const job = await jobModel
      .findOne({ _id: id }, selection)
      .populate({ path: 'postedBy', select: { name: 1, _id: 1 } })
      .catch((error: Error) => {
        throw error;
      });
    if (job['confirmedApplication']) {
      await jobModel.populate(job, {
        path: 'confirmedApplication',
        populate: {
          path: 'appliedBy',
          options: { select: { name: 1, _id: 1, email: 1, mobileNumber: 1 } },
        },
      });
    }
    return job;
  }

  // get particular job details by id
  public async getJob(id: mongoose.Types.ObjectId): Promise<ICreateJob | null> {
    const selection = {
      __v: 0,
    };
    const job = await jobModel.findOne({ _id: id }, selection).catch((error: Error) => {
      throw error;
    });
    return job;
  }

  /**
   * Responsible to change the job status
   * job status change to allocation and set the confirmed application to job collection
   */
  public async jobApproved(
    jobId: mongoose.Types.ObjectId,
    jobApplyId: mongoose.Types.ObjectId,
  ): Promise<IJob | null> {
    const job = await jobModel
      .findOneAndUpdate(
        { _id: jobId },
        { status: JobStatus.sp_allocated, confirmedApplication: jobApplyId },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });

    return job;
  }

  /**
   * change job status for cancellation
   * @param jobId
   * @param jobStatus
   */
  public async jobStatusModify(
    jobId: mongoose.Types.ObjectId,
    jobStatus: JobStatus,
  ): Promise<IJob | null> {
    const job = await jobModel
      .findOneAndUpdate(
        { _id: jobId },
        { status: jobStatus, confirmedApplication: null },
        { new: true },
      )
      .catch((error: Error) => {
        throw error;
      });

    return job;
  }

  /**
   * change job status
   * @param jobId
   * @param jobStatus
   */
  public async jobStatusChange(
    jobId: mongoose.Types.ObjectId,
    jobStatus: JobStatus,
  ): Promise<IJob | null> {
    const job = await jobModel
      .findOneAndUpdate({ _id: jobId }, { status: jobStatus }, { new: true })
      .catch((error: Error) => {
        throw error;
      });

    return job;
  }
}

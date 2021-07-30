import jobApplyModel from '@modules/jobApply/schema';
import { IJobApply, JobApplicationStatus } from '@modules/jobApply/model';
import mongoose, { Types } from 'mongoose';
import { IUser } from '@modules/users/model';
import { IAppliedJobIds, ICreateJob, IJob } from '@modules/job/model';
import jobModel from '@modules/job/schema';

export class JobApplyService {
  /**
   * Save new Job into db
   * @param services
   */
  public async saveJobApply(applyJob: IJobApply, userDetails: IUser): Promise<IJobApply | null> {
    const newJobApply = new jobApplyModel({
      jobId: applyJob.jobId,
      appliedBy: userDetails._id,
      serviceTime: applyJob.serviceTime,
    });

    await newJobApply.save().catch((error: Error) => {
      throw error;
    });

    return newJobApply;
  }

  // Save job for fixed job
  public async saveJobApplyForFixedJob(
    applyJob: IJobApply,
    userDetails: IUser,
    serviceTime: string,
  ): Promise<IJobApply | null> {
    const newJobApply = new jobApplyModel({
      jobId: applyJob.jobId,
      appliedBy: userDetails._id,
      serviceTime: serviceTime,
    });

    await newJobApply.save().catch((error: Error) => {
      throw error;
    });

    return newJobApply;
  }

  // Check job id is valid or not
  public async validateJobId(jobId: mongoose.Types.ObjectId): Promise<IJob | null> {
    const isValidJobId: IJob = await jobModel
      .findOne(
        {
          _id: jobId,
        },
        { flexibleTime: 1, fixedTime: 1, duration: 1, status: 1 },
      )
      .catch((error: Error) => {
        throw error;
      });
    if (isValidJobId) {
      return isValidJobId;
    }
    return null;
  }

  // check job applied only one time or not
  public async checkAppliedOnce(
    userId: Types.ObjectId,
    jobId: Types.ObjectId,
  ): Promise<IJob | null> {
    const isApplied = await jobApplyModel
      .findOne({ appliedBy: userId, jobId })
      .catch((error: Error) => {
        throw error;
      });
    return isApplied;
  }

  // Get total jobApplied by service professional
  public async getTotaljobsByCondition(
    serviceProfId: mongoose.Types.ObjectId,
  ): Promise<number | null> {
    // Finding total appliedJobs
    const totalJobs = await jobApplyModel
      .countDocuments({ appliedBy: serviceProfId })
      .catch((error: Error) => {
        throw error;
      });
    return totalJobs;
  }

  // Fetch all jobs applied by service professional
  public async getAppliedJobsByServiceProfessional(
    serviceProfId: mongoose.Types.ObjectId,
    page: number,
    limit: number,
    skip: number,
  ): Promise<IJobApply | null> {
    const selection = {
      updatedAt: 0,
      __v: 0,
    };

    // Fetching paginating applied jobs
    const job = await jobApplyModel
      .find({ appliedBy: serviceProfId }, selection)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'jobId',
        select: {
          updatedAt: 0,
          __v: 0,
        },
        populate: {
          path: 'postedBy',
          select: {
            password: 0,
            isVerifiedEmail: 0,
            status: 0,
            addresses: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      })
      .catch((error: Error) => {
        throw error;
      });
    return job;
  }

  /**
   * get all jobs applied if active
   * @param jobId
   */
  public async getAppliedJobsById(jobId: string): Promise<ICreateJob[]> {
    const appliedJobs: Array<ICreateJob> = await jobApplyModel
      .find({
        jobId,
        status: {
          $nin: [
            JobApplicationStatus.applicationCanceled,
            JobApplicationStatus.jobCanceled,
            JobApplicationStatus.rejected,
          ],
        },
      })
      .sort({ createdAt: -1 })
      .populate({
        path: 'appliedBy',
        select: {
          status: 0,
          isVerifiedEmail: 0,
          isverifiedemail: 0,
          type: 0,
          password: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .catch((error: Error) => {
        throw error;
      });

    return appliedJobs;
  }

  /**
   * get all ids of SP's applied jobs
   */
  public async getAppliedJobIds(userId: Types.ObjectId): Promise<IAppliedJobIds[]> {
    const appliedJobIds = await jobApplyModel.aggregate([
      { $match: { appliedBy: userId } },
      {
        $group: {
          _id: 0,
          ids: { $push: '$jobId' },
        },
      },
    ]);
    return appliedJobIds;
  }

  /**
   * change application status
   */
  public async changeJobApplicationStatus(
    jobApplyId: mongoose.Types.ObjectId,
    status: JobApplicationStatus,
  ): Promise<IJobApply | null> {
    const jobApply = await jobApplyModel
      .findOneAndUpdate({ _id: jobApplyId }, { status: status }, { new: true })
      .populate({
        path: 'appliedBy',
        select: {
          name: 1,
          email: 1,
          mobileNumber: 1,
          _id: 1,
        },
      })
      .catch((error: Error) => {
        throw error;
      });
    await jobApplyModel.populate(jobApply, {
      path: 'jobId',
    });

    return jobApply;
  }

  // Fetch a job application by its Id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getApplyJob(jobApplyId: mongoose.Types.ObjectId): Promise<any> {
    const jobApply = await jobApplyModel
      .findById(jobApplyId)
      .populate({
        path: 'appliedBy',
        select: {
          status: 0,
          isVerifiedEmail: 0,
          isverifiedemail: 0,
          type: 0,
          password: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      })
      .populate({
        path: 'jobId',
        select: {
          status: 1,
          rate: 1,
        },
      })
      .catch((error: Error) => {
        throw error;
      });
    return jobApply;
  }

  // job application status changed to cancel
  public async jobApplyStatusModify(jobId: mongoose.Types.ObjectId): Promise<void> {
    await jobApplyModel
      .updateMany({ jobId: jobId }, { status: JobApplicationStatus.jobCanceled })
      .catch((error: Error) => {
        throw error;
      });
  }

  // job application status changed after Job Approved
  public async jobApplyStatusModifyAfterApproved(jobId: mongoose.Types.ObjectId): Promise<void> {
    await jobApplyModel
      .updateMany(
        {
          jobId: jobId,
          status: {
            $nin: [JobApplicationStatus.approved],
          },
        },
        { status: JobApplicationStatus.rejected },
      )
      .catch((error: Error) => {
        throw error;
      });
  }

  /**
   * Cancel job application by changing status
   */
  public async jobApplyCancel(
    jobApplyId: mongoose.Types.ObjectId,
    status: JobApplicationStatus,
  ): Promise<IJob | null> {
    const application = await jobApplyModel
      .findOneAndUpdate({ _id: jobApplyId }, { status }, { new: true })
      .populate({
        path: 'jobId',
        select: {
          updatedAt: 0,
          __v: 0,
        },
        populate: {
          path: 'postedBy',
          select: {
            password: 0,
            isVerifiedEmail: 0,
            status: 0,
            addresses: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      })
      .catch((error: Error) => {
        throw error;
      });
    return application;
  }
}

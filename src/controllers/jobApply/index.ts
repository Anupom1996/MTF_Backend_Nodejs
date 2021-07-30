import { Request, Response } from 'express';
import { JobApplyService } from '@services/jobApply';
import { IJobApply, JobApplicationStatus } from '@modules/jobApply/model';
import { JobStatus } from '@modules/job/model';
import moment from 'moment';
import { UserType } from '@modules/users/model';
import mongoose from 'mongoose';
import { JobService } from '@services/job';

export class JobApplyTypesController {
  private jobApplyService: JobApplyService;
  private jobService: JobService;

  constructor() {
    this.jobApplyService = new JobApplyService();
    this.jobService = new JobService();
  }
  /**
   * Add new job apply
   */
  public async createJobApply(req: Request, res: Response): Promise<void> {
    const reqBody: IJobApply = req.body;
    const userType: UserType = req.userDetails.type;

    if (userType === UserType.serviceProfessional) {
      const validateJobId = await this.jobApplyService.validateJobId(reqBody.jobId).catch((err) => {
        res.serverError(err);
        throw err;
      });

      // check job id is exist or not
      if (validateJobId) {
        // apply only if job is active
        if (validateJobId.status === JobStatus.active) {
          // check SP apply for only one time
          const isAppliedOnce = await this.jobApplyService
            .checkAppliedOnce(req.userDetails._id, reqBody.jobId)
            .catch((err) => {
              res.serverError(err);
              throw err;
            });
          if (!isAppliedOnce) {
            // Check for job is flexible or fixed
            if (
              validateJobId.flexibleTime.start !== null &&
              validateJobId.flexibleTime.end !== null
            ) {
              if (reqBody.serviceTime) {
                const serviceTime = moment(new Date(reqBody.serviceTime)).valueOf();
                const startDate = moment(validateJobId.flexibleTime.start).valueOf();
                const endDate = moment(validateJobId.flexibleTime.end).valueOf();

                if (serviceTime > startDate && serviceTime < endDate) {
                  const newJobApply = await this.jobApplyService
                    .saveJobApply(reqBody, req.userDetails)
                    .catch((err) => {
                      res.serverError(err);
                      throw err;
                    });
                  if (newJobApply) {
                    res.created(res.__('jobApplyCreated'));
                  } else {
                    res.badRequest([res.__('jobApplyInsertionFailed')]);
                  }
                } else {
                  res.badRequest([res.__('serviceTimeInvalid')]);
                }
              } else {
                res.badRequest([res.__('serviceTimeRequired')]);
              }
            } else {
              if (!reqBody.serviceTime) {
                const newJobApply = await this.jobApplyService
                  .saveJobApplyForFixedJob(reqBody, req.userDetails, validateJobId.fixedTime)
                  .catch((err) => {
                    res.serverError(err);
                    throw err;
                  });
                if (newJobApply) {
                  res.created(res.__('jobApplyCreated'));
                } else {
                  res.badRequest([res.__('jobApplyInsertionFailed')]);
                }
              } else {
                res.badRequest([res.__('thisIsFixedTimePost')]);
              }
            }
          } else {
            res.badRequest([res.__('applyOnce')]);
          }
        } else {
          res.badRequest([res.__('jobCanceled')]);
        }
      } else {
        res.badRequest([res.__('invalidJobId')]);
      }
    } else {
      res.badRequest([res.__('mustBeServiceProfessional')]);
    }
  }

  // Get all jobs of current service professional
  public async getAppliedJobsByServiceProfessional(req: Request, res: Response): Promise<void> {
    const id = req.userDetails._id;
    const userType: UserType = req.userDetails.type;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = limit * (page - 1);
    let highestPage;

    if (userType === UserType.serviceProfessional) {
      // Page number must greater than zero
      if (page <= 0 || limit <= 0) {
        return res.badRequest([res.__('invalidPageRequest')]);
      }

      // Get total jobs of service professional by condition
      const totalJobsOfServiceProf = await this.jobApplyService
        .getTotaljobsByCondition(id)
        .catch((err) => {
          res.serverError(err);
          throw err;
        });

      if (totalJobsOfServiceProf) {
        // Error if page request exceed total jobs
        highestPage = Math.ceil(totalJobsOfServiceProf / limit);
        if (page > highestPage) {
          return res.badRequest([res.__('invalidPageRequest')]);
        }
      } else {
        return res.noData(res.__('noJobFound'));
      }

      // Get all applied jobs by service professional with pagination
      const allJobs = await this.jobApplyService
        .getAppliedJobsByServiceProfessional(id, page, limit, skip)
        .catch((err) => {
          res.serverError(err);
          throw err;
        });

      if (allJobs) {
        // response body structure
        const data = {
          data: allJobs,
          total: totalJobsOfServiceProf,
          page: {
            size: limit,
            total: highestPage,
            current: page,
          },
        };
        res.ok(data);
      } else {
        res.noData(res.__('noJobFound'));
      }
    } else {
      res.badRequest([res.__('mustBeServiceProfessional')]);
    }
  }

  /**
   * Get all jobs applied by SP by job Id
   * return only active application
   */
  public async getAppliedJobsById(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    const appliedJobs = await this.jobApplyService.getAppliedJobsById(jobId).catch((err: Error) => {
      res.serverError(err);
      throw err;
    });

    // job found or not checking
    if (appliedJobs.length >= 1) {
      res.ok(appliedJobs);
    } else {
      res.noData();
    }
  }

  public async getJobApplyById(req: Request, res: Response): Promise<void> {
    const jobApplyId = req.params.jobApplyId;
    const jobApply = await this.jobApplyService
      .getApplyJob(mongoose.Types.ObjectId(jobApplyId))
      .catch((err) => {
        res.serverError(err);
        throw err;
      });
    res.ok(jobApply);
  }

  /**
   * Responsible for cancel the job application
   * Both customer and SP can cancel application
   * applied => change application status (canceled or rejected)
   * approved => change application status as well as job status
   */
  public async jobApplicationCancellation(req: Request, res: Response): Promise<void> {
    const jobApplyId = req.body.jobApplyId;
    const userType: UserType = req.userDetails.type;

    const jobApply = await this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
      res.serverError(err);
      throw err;
    });

    // common function responsible for cancel and reject job
    const applicationCancelFunction = async () => {
      let applicationCancel;
      // professional canceled
      if (userType === UserType.serviceProfessional) {
        applicationCancel = await this.jobApplyService
          .jobApplyCancel(jobApplyId, JobApplicationStatus.applicationCanceled)
          .catch((err) => {
            res.serverError(err);
            throw err;
          });
        // customer canceled
      } else if (userType === UserType.customer) {
        applicationCancel = await this.jobApplyService
          .jobApplyCancel(jobApplyId, JobApplicationStatus.rejected)
          .catch((err) => {
            res.serverError(err);
            throw err;
          });
      }
      return applicationCancel;
    };

    if (jobApply) {
      // check if job is not canceled yet
      if (jobApply.jobId.status !== JobStatus.canceled) {
        // job must not be in progress
        if (
          jobApply.status !== JobApplicationStatus.workStarted &&
          jobApply.status !== JobApplicationStatus.workCompleted
        ) {
          // SP applied
          if (jobApply.status === JobApplicationStatus.applied) {
            const applicationCancel = await applicationCancelFunction();
            if (applicationCancel) {
              res.ok(applicationCancel);
            }
            // SP approved
          } else if (jobApply.status === JobApplicationStatus.approved) {
            const applicationCancel = await applicationCancelFunction();
            const job = await this.jobService
              .jobStatusModify(jobApply.jobId, JobStatus.active)
              .catch((err) => {
                res.serverError(err);
                throw err;
              });
            if (applicationCancel && job) {
              res.ok(applicationCancel);
            }
          } else {
            res.badRequest([res.__('applicationCanceled')]);
          }
        } else {
          res.badRequest([res.__('jobInProgress')]);
        }
      } else {
        res.badRequest([res.__('jobCanceled')]);
      }
    } else {
      res.badRequest([res.__('jobApplyIdIncorrect')]);
    }
  }
}

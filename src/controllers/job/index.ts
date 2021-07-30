import { Request, Response } from 'express';
import { JobService } from '@services/job';
import { ServiceService } from '@services/service';
import { ICreateJob, JobStatus } from '@modules/job/model';
import { JobApplyService } from '@services/jobApply';
import { IAddressResponseObject, UserType } from '@modules/users/model';
import mongoose from 'mongoose';
import { JobApplicationStatus } from '@modules/jobApply/model';

export class JobTypesController {
  private jobService: JobService;
  private serviceService: ServiceService;
  private jobApplyService: JobApplyService;

  constructor() {
    this.jobService = new JobService();
    this.serviceService = new ServiceService();
    this.jobApplyService = new JobApplyService();
  }
  /**
   * Add new job
   */
  public async createJob(req: Request, res: Response): Promise<void> {
    const reqBody: ICreateJob = req.body;
    const userType: UserType = req.userDetails.type;
    let jobLocation = {};
    // Validate service category and sub-category

    if (userType === UserType.customer) {
      const userAddresses: Array<IAddressResponseObject> = req.userDetails.addresses;
      let flag = false;
      userAddresses.forEach((address) => {
        if (address._id == reqBody.location) {
          flag = true;
          jobLocation = address.address;
        }
      });
      if (flag) {
        const validateService = await this.serviceService
          .validateService(reqBody.serviceCategoryId, reqBody.serviceSubCategoryId)
          .catch((err) => {
            res.serverError(err);
            throw err;
          });
        if (validateService) {
          // job create service called
          const newJob = await this.jobService
            .saveJob(reqBody, req.userDetails, validateService.subCategory[0].rate, jobLocation)
            .catch((err) => {
              res.serverError(err);
              throw err;
            });
          // checking for inserted or not
          if (newJob) {
            res.created(res.__('jobCreated'));
          } else {
            res.badRequest([res.__('insertionFailed')]);
          }
        } else {
          res.badRequest([res.__('invalidServiceId')]);
        }
      } else {
        res.badRequest([res.__('invalidAddressId')]);
      }
    } else {
      res.badRequest([res.__('mustBeCustomer')]);
    }
  }

  /**
   * If Service Professional: Ftech all posted jobs,
   * If Customer: Fecth job posted by that customer
   */
  public async getJobPosts(req: Request, res: Response): Promise<void> {
    const userId = req.userDetails._id;
    const userType = req.userDetails.type;
    const pageNumber = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = limit * (pageNumber - 1);
    if (pageNumber > 0 && limit > 0) {
      // Condition for customer
      if (userType === UserType.customer) {
        // get all jobs posted by customer
        const totalJobs = await this.jobService.countCustomerJobs(userId).catch((err) => {
          res.serverError(err);
          throw err;
        });
        if (totalJobs) {
          // total pages in db
          const highestPage = Math.ceil(totalJobs / limit);
          const page = {
            size: limit,
            total: highestPage,
            current: pageNumber,
          };
          // page number excced total pages
          if (pageNumber <= highestPage) {
            const jobPostByCustomer = await this.jobService
              .getJobByCustomerId(userId, limit, skip)
              .catch((err) => {
                res.serverError(err);
                throw err;
              });

            const resBody = {
              data: jobPostByCustomer,
              total: totalJobs,
              page: page,
            };
            res.ok(resBody);
          } else {
            res.badRequest([res.__('invalidPageRequest')]);
          }
        } else {
          res.noData(res.__('noJobFound'));
        }
      } else {
        // total job count for service professional
        const totalJobs = await this.jobService.countJobs().catch((err) => {
          res.serverError(err);
          throw err;
        });
        if (totalJobs) {
          // total pages in db
          const highestPage = Math.ceil(totalJobs / limit);
          const page = {
            size: limit,
            total: highestPage,
            current: pageNumber,
          };
          // get SP's applied job ids
          const appliedJobIds = await this.jobApplyService.getAppliedJobIds(userId).catch((err) => {
            res.serverError(err);
            throw err;
          });

          // page number excced total pages
          if (pageNumber <= highestPage) {
            const jobPosts = await this.jobService
              .getJobs(appliedJobIds.length ? appliedJobIds[0].ids : [], limit, skip)
              .catch((err) => {
                res.serverError(err);
                throw err;
              });
            const resBody = {
              data: jobPosts,
              total: totalJobs,
              page: page,
            };
            res.ok(resBody);
          } else {
            res.badRequest([res.__('invalidPageRequest')]);
          }
        } else {
          res.noData(res.__('noJobFound'));
        }
      }
    } else {
      res.badRequest([res.__('invalidPageRequest')]);
    }
  }

  // Get particular job details by jobId
  public async getJobPostById(req: Request, res: Response): Promise<void> {
    const jobId = req.params.jobId;
    // get job details
    const job = await this.jobService.getJobById(mongoose.Types.ObjectId(jobId)).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (job) {
      res.ok(job);
    } else {
      res.noData();
    }
  }

  /* Approve Job Application */
  public async jobApproval(req: Request, res: Response): Promise<void> {
    const jobId = req.body.jobId;
    const jobApplyId = req.body.jobApplyId;

    const job = await this.jobService.getJobById(mongoose.Types.ObjectId(jobId)).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (job) {
      const jobApply = await this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
        res.serverError(err);
        throw err;
      });
      if (jobApply) {
        if (jobApply.status === JobApplicationStatus.applied) {
          const currentJob = await this.jobService.jobApproved(jobId, jobApplyId).catch((err) => {
            res.serverError(err);
          });
          if (currentJob) {
            const jobApplication = await this.jobApplyService
              .changeJobApplicationStatus(jobApplyId, JobApplicationStatus.approved)
              .catch((err) => {
                res.serverError(err);
                throw err;
              });
            if (jobApplication) {
              res.ok(jobApplication);
            } else {
              res.badRequest();
            }
          } else {
            res.badRequest();
          }
        } else {
          res.badRequest([res.__('applicationCanceled')]);
        }
      } else {
        res.noData();
      }
    } else {
      res.noData();
    }
  }

  /**
   * Responsible for changing progress status in job and application
   * SP can start and complete the job
   * Customer can complete and finish the job
   */
  public async jobProgress(req: Request, res: Response): Promise<void> {
    const jobApplyId = req.body.jobApplyId;
    const status = req.body.status;
    const userType = req.userDetails.type;

    // get job apply details by id
    const jobApply = await this.jobApplyService.getApplyJob(jobApplyId).catch((err) => {
      res.serverError(err);
      throw err;
    });

    if (jobApply) {
      // only if job is allocated to SP
      if (jobApply.jobId.status !== JobStatus.canceled) {
        // only if application not canceled
        if (
          jobApply.status !== JobApplicationStatus.jobCanceled &&
          jobApply.status !== JobApplicationStatus.rejected &&
          jobApply.status !== JobApplicationStatus.applicationCanceled
        ) {
          // if requested status is 'work_started'
          if (status === JobApplicationStatus.workStarted) {
            // user must be SP
            if (userType === UserType.serviceProfessional) {
              // change job status to sp_work_started
              const job = await this.jobService
                .jobStatusChange(jobApply.jobId._id, JobStatus.work_started)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              // change application status to work_started
              const application = await this.jobApplyService
                .changeJobApplicationStatus(jobApplyId, status)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              if (job && application) {
                res.ok(application);
              } else {
                res.badRequest();
              }
            } else {
              res.badRequest([res.__('mustBeServiceProfessional')]);
            }
            // if requested status is 'work_completed'
          } else if (status === JobApplicationStatus.workCompleted) {
            if (userType === UserType.serviceProfessional) {
              // change job status to sp_work_started
              const job = await this.jobService
                .jobStatusChange(jobApply.jobId._id, JobStatus.work_completed)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              // change application status to work_completed
              const application = await this.jobApplyService
                .changeJobApplicationStatus(jobApplyId, status)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              if (job && application) {
                res.ok(application);
              } else {
                res.badRequest();
              }
            } else {
              res.badRequest([res.__('mustBeServiceProfessional')]);
            }
          } else if (status === JobStatus.completed) {
            // user must be customer
            if (userType === UserType.customer) {
              // change job status to completed
              const job = await this.jobService
                .jobStatusChange(jobApply.jobId._id, JobStatus.completed)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              // change application status to completed
              const application = await this.jobApplyService
                .changeJobApplicationStatus(jobApplyId, status)
                .catch((err) => {
                  res.serverError(err);
                  throw err;
                });
              if (job && application) {
                res.ok(job);
              } else {
                res.badRequest();
              }
            } else {
              res.badRequest([res.__('mustBeCustomer')]);
            }
          } else {
            res.badRequest([res.__('invalidStatus')]);
          }
        } else {
          res.badRequest([res.__('applicationCanceled')]);
        }
      } else {
        res.badRequest([res.__('jobCanceled')]);
      }
    } else {
      res.badRequest([res.__('jobApplyIdIncorrect')]);
    }
  }

  // Responsible for cancel the job and change status
  public async jobCancellation(req: Request, res: Response): Promise<void> {
    const jobId = req.body.jobId;
    // get job details by id
    const job = await this.jobService.getJob(jobId).catch((err) => {
      res.serverError(err);
    });

    if (job) {
      // Job must not canceled yet
      if (job.status !== JobStatus.canceled) {
        // Job must not started yet
        if (job.status !== JobStatus.work_started && job.status !== JobStatus.work_completed) {
          // only situations when job can be cancel
          if (
            job.status === JobStatus.active ||
            job.status === JobStatus.sp_allocated ||
            job.status === JobStatus.payment_initiated
          ) {
            const jobCanceled = await this.jobService
              .jobStatusModify(jobId, JobStatus.canceled)
              .catch((err) => {
                res.serverError(err);
                throw err;
              });
            await this.jobApplyService.jobApplyStatusModify(jobId).catch((err) => {
              res.serverError(err);
            });
            if (jobCanceled) {
              res.ok(jobCanceled);
            }
          } else {
            res.badRequest([res.__('')]);
          }
        } else {
          res.badRequest([res.__('jobInProgress')]);
        }
      } else {
        res.badRequest([res.__('jobCanceled')]);
      }
    } else {
      res.badRequest([res.__('jobIdIncorrect')]);
    }
  }
}

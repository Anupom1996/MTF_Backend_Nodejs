import { Request, Response } from 'express';
import { JobService } from '@services/job';
import { JobApplyService } from '@services/jobApply';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { JobApplicationStatus } from '@modules/jobApply/model';
import { PaymentService } from '@services/payment';
import { JobStatus } from '@modules/job/model';

const secretKey = process.env.SECRET_KEY || '';
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET || '';

const stripe: Stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' });

export class PaymentController {
  private jobService: JobService;
  private jobApplyService: JobApplyService;
  private paymentService: PaymentService;

  constructor() {
    this.jobService = new JobService();
    this.jobApplyService = new JobApplyService();
    this.paymentService = new PaymentService();
  }

  public async payment(req: Request, res: Response) {
    const jobId = req.body.jobId;
    const jobApplicationId = req.body.jobApplyId;

    const job = await this.jobService.getJobById(mongoose.Types.ObjectId(jobId)).catch((err) => {
      res.serverError(err);
      throw err;
    });
    if (job) {
      const customerId = job.postedBy._id.toString();
      const customerName = job.postedBy.name.first + ' ' + job.postedBy.name.last;
      const jobApply = await this.jobApplyService.getApplyJob(jobApplicationId).catch((err) => {
        res.serverError(err);
      });
      if (jobApply) {
        const serviceProfessionalId = jobApply.appliedBy._id.toString();
        const serviceProfessionalName =
          jobApply.appliedBy.name.first + ' ' + jobApply.appliedBy.name.last;
        const paymentIntent: Stripe.PaymentIntent = await stripe.paymentIntents
          .create({
            amount: parseInt(jobApply.jobId.rate) * 100,
            currency: 'gbp',
            metadata: {
              jobId,
              jobApplicationId,
              customerName,
              customerId,
              serviceProfessionalName,
              serviceProfessionalId,
            },
          })
          .catch((err) => {
            console.log(err);
            return res.badRequest([res.__(err)]);
          });
        if (paymentIntent.id) {
          await this.jobService.jobStatusModify(jobId, JobStatus.payment_initiated).catch((err) => {
            res.serverError(err);
            throw err;
          });
          res.send({ data: paymentIntent });
        } else {
          res.status(500).send('server error');
        }
      } else {
        res.noData();
      }
    } else {
      res.noData();
    }
  }

  public async webhookController(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] || '';

    let event = null;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(err);
      res.status(400).end();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let intent: any = null;
    if (event.data.object) {
      intent = event.data.object;
      await this.paymentService
        .saveJobPayment(intent)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    switch (event['type']) {
      case 'payment_intent.succeeded':
        intent = event.data.object;
        // await this.paymentService
        //   .saveJobPayment(intent)
        //   .then((res) => {
        //     console.log(res);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });

        await this.jobService
          .jobApproved(intent.metadata.jobId, intent.metadata.jobApplicationId)
          .catch((err) => {
            console.log(1);
            throw err;
          })

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .then(async (currentJob) => {
            await this.jobApplyService
              .changeJobApplicationStatus(
                intent.metadata.jobApplicationId,
                JobApplicationStatus.approved,
              )
              .catch((err) => {
                console.log(err);
              })
              .then(async (jobApplication) => {
                console.log(jobApplication);
                await this.jobApplyService.jobApplyStatusModifyAfterApproved(intent.metadata.jobId);
              });
          });

        console.log('Payment intent succeeded:', intent);
        break;
      case 'payment_intent.payment_failed':
        intent = event.data.object;
        console.log('payment failed');
        await this.jobService
          .jobStatusModify(intent.metadata.jobId, JobStatus.active)
          .then((job) => console.log(job))
          .catch((err) => console.log(err));
        break;
      default:
        intent = event.data.object;
        console.log('Failed:', intent);
        break;
    }

    res.sendStatus(200);
  }

  public async payments(req: Request, res: Response) {
    const jobId = req.params.jobId;
    await this.paymentService
      .getPaymentInfo(mongoose.Types.ObjectId(jobId))
      .catch((err) => {
        res.badRequest([res.__(err)]);
      })
      .then((result) => res.ok(result));
  }
}

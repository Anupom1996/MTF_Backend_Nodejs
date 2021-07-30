import { Document } from 'mongoose';

export interface IPaymentInfo extends Document {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application: null;
  application_fee_amount: number;
  canceled_at: null;
  cancellation_reason: null;
  capture_method: string;
  charges: Record<string, unknown>;
  cient_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: Record<string, unknown>;
  description: Record<string, unknown>;
  invoice: Record<string, unknown>;
  last_payment_error: Record<string, unknown>;
  livemode: boolean;
  metadata: {
    jobId: string;
    jobApplicationId: string;
  };
  next_action: Record<string, unknown>;
  on_behalf_of: Record<string, unknown>;
  payment_method: string;
  payment_method_options: {
    card: Record<string, unknown>;
  };
  payment_method_types: [];
  receipt_email: string;
  review: Record<string, unknown>;
  setup_future_usage: Record<string, unknown>;
  shipping: Record<string, unknown>;
  source: Record<string, unknown>;
  statement_descriptor: Record<string, unknown>;
  statement_descriptor_suffix: Record<string, unknown>;
  status: string;
  transfer_data: Record<string, unknown>;
  transfer_group: Record<string, unknown>;
}

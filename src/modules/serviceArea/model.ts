import { Document } from 'mongoose';

export interface IServiceArea extends Document {
  postcode: string;
}

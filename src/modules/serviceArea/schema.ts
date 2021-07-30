import mongoose, { Schema } from 'mongoose';
import { IServiceArea } from './model';

const ServiceAreaSchema: Schema = new Schema(
  {
    postcode: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  },
);

// Export the model and return your IUser interface
export default mongoose.model<IServiceArea>('serviceAreaModel', ServiceAreaSchema, 'serviceArea');

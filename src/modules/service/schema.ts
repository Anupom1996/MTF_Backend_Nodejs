import mongoose, { Schema } from 'mongoose';
import { IService } from './model';

const ServiceSchema: Schema = new Schema(
  {
    category: { type: String, required: true },
    subCategory: [
      {
        serviceName: { type: String, trim: true, required: true },
        description: { type: String, trim: true, required: true },
        rate: { type: Number, required: true },
      },
    ],
  },

  {
    timestamps: true,
  },
);

// Export the model and return your IService interface
export default mongoose.model<IService>('serviceModel', ServiceSchema, 'service');

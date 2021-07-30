import { Document, Types } from 'mongoose';

export interface IService extends Document {
  category: string;
  subCategory: Array<IServiceSubCategory>;
}
export interface IServiceSubCategory extends Document {
  serviceName: string;
  description: string;
  rate: number;
}

export interface ISubCatModel {
  _id: Types.ObjectId;
  serviceName: string;
  slug: string;
  description: string;
  rate: 10;
}

export interface ISubCategories {
  id: number;
  subCategories: Array<ISubCatModel>;
}

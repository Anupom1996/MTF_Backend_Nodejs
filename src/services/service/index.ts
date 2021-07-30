import { IService } from '@modules/service/model';
import serviceModel from '@modules/service/schema';
import serviceAreaModel from '@modules/serviceArea/schema';
import mongoose from 'mongoose';

export class ServiceService {
  // Responsible for validate category and subcategory is exist
  // return service details if exist
  public async validateService(
    categoryId: mongoose.Types.ObjectId,
    subCategoryId: mongoose.Types.ObjectId,
  ): Promise<IService | null> {
    const subCategoryRate: IService = await serviceModel
      .findOne(
        {
          _id: categoryId,
          'subCategory._id': subCategoryId,
        },
        { 'subCategory.rate': 1 },
      )
      .catch((error: Error) => {
        console.log(error);
        throw error;
      });

    if (!subCategoryRate) {
      return null;
    }
    return subCategoryRate;
  }

  // Insert service areas in db if unique
  public async saveUniqueServiceArea(areas: Array<string>): Promise<void> {
    const data = [];
    let postcodes: Array<string> = [];
    postcodes = await serviceAreaModel.distinct('postcode').catch((error: Error) => {
      throw error;
    });
    for (const area of areas) {
      if (!postcodes.includes(area)) {
        data.push({ postcode: area });
      }
    }
    console.log(data);
    await serviceAreaModel.insertMany(data).catch((error: Error) => {
      throw error;
    });
  }

  // get all service sub-categories
  public async getServices(): Promise<IService> {
    const selection = {
      __v: 0,
    };
    const subcats = await serviceModel.find({}, selection).catch((error: Error) => {
      throw error;
    });
    return subcats;
  }
}

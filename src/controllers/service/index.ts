import { Request, Response } from 'express';
import { ServiceService } from '@services/service';

export class ServiceController {
  private serviceService: ServiceService;

  constructor() {
    this.serviceService = new ServiceService();
  }

  /**
   * get all the sub categories of service
   * @param req
   * @param res
   */
  public async getServices(req: Request, res: Response): Promise<void> {
    //getting all the sub categories
    const subCategories = await this.serviceService.getServices().catch((err: Error) => {
      res.serverError(err);
      throw err;
    });
    if (subCategories) {
      res.ok(subCategories);
    } else {
      res.noData();
    }
  }
}

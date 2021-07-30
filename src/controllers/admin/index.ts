import { Request, Response } from 'express';
import { AdminService } from '@services/admin';
import { IAdminStatus, ILoginAdminRequest } from '@modules/admin/model';
import { UserType, IUserStatus } from '@modules/users/model';
import bcrypt from 'bcrypt';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * This function is responsible for admin Login
   * @param req email password
   * @param res
   */
  public async adminLogin(req: Request, res: Response): Promise<void> {
    const reqBody: ILoginAdminRequest = req.body;
    // get admin details by email
    const adminDetails = await this.adminService
      .getAdminDetailsByEmail(reqBody.email)
      .catch((err) => {
        res.serverError(err);
        throw err;
      });

    if (adminDetails) {
      // password compare process
      const isSame = await bcrypt
        .compare(reqBody.password, adminDetails.password)
        .catch((err: Error) => {
          res.serverError(err);
          throw err;
        });

      if (isSame) {
        // check admin is active
        if (adminDetails.status === IAdminStatus.Active) {
          // genrate token and send responses
          return res.ok(this.adminService.genrateAdminTokens(adminDetails));
        }
      } else {
        res.badRequest([res.__('invalidCredentials')]);
      }
    } else {
      res.badRequest([res.__('invalidCredentials')]);
    }
  }

  /**
   * This function is admin for genrating new refresh token
   * @param req
   * @param res
   */
  public async genrateNewToken(req: Request, res: Response): Promise<void> {
    if (req.adminDetails) {
      res.ok(this.adminService.genrateAdminTokens(req.adminDetails));
    } else {
      res.forbidden('unAuthorizedAccess');
    }
  }

  public async getUserListing(req: Request, res: Response): Promise<void> {
    const userType = req.params.type;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const condition: any = {};
    // checking user type
    if (userType == UserType.customer) {
      condition['type'] = UserType.customer;
    } else if (userType == UserType.serviceProfessional) {
      condition['type'] = UserType.serviceProfessional;
    }

    // getting all users in db with filter type
    const allUsers = await this.adminService.getUsers(condition).catch((err: Error) => {
      res.serverError(err);
      throw err;
    });

    if (allUsers) {
      res.ok(allUsers);
    } else {
      res.noData();
    }
  }
  public async profileActivation(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    // get user details by id
    const userDetails = await this.adminService.getUserDetailsById(userId).catch((err) => {
      res.serverError(err);
      throw err;
    });

    if (userDetails.status === IUserStatus.Active) {
      const isInactive = await this.adminService.updateStatusInactive(userId).catch((err) => {
        res.serverError(err);
        throw err;
      });
      return res.ok(isInactive);
    } else {
      const isActive = await this.adminService.updateStatusActive(userId).catch((err) => {
        res.serverError(err);
        throw err;
      });
      return res.ok(isActive);
    }
  }

  //admin Search the UserDetails.............
  public async getUserSearching(req: Request, res: Response): Promise<void> {
    const searchText = req.query.searchText || null;
    const type = req.query.type || null;

    const limit = Number(req.query.limit) || 100;
    console.log(limit);
    let condition;
    // checking user type
    if (type == UserType.customer) {
      //checking type are CUSTOMER or Not
      condition = UserType.customer;
    } else if (type == UserType.serviceProfessional) {
      //checking type are SERVICE_PROFESSIONAL  or not
      condition = UserType.serviceProfessional;
    } else {
      //here type do not match excat type thatswhy null
      condition = null;
    }
    console.log('this is ', type, 'aaa');
    console.log('this is ', condition, 'aaa');
    if (searchText && type == null) {
      console.log(type);
      if (limit > 0) {
        const allUsers = await this.adminService
          .getUsersData(searchText, condition, limit)
          .catch((err: Error) => {
            res.serverError(err);
            throw err;
          });

        if (allUsers) {
          res.ok(allUsers);
        } else {
          res.noData();
        }
      } else {
        res.badRequest([res.__('invalidLimitRequest')]);
      }
    } else {
      if (limit != null) {
        if (limit > 0) {
          //checking type null or not
          if (condition != null) {
            const allUsers = await this.adminService
              .getUsersData(searchText, condition, limit)
              .catch((err: Error) => {
                res.serverError(err);
                throw err;
              });

            if (allUsers) {
              res.ok(allUsers);
            } else {
              res.noData();
            }
            //if user give the invalid type request
          } else {
            console.log('a2');
            console.log(limit, 'is');
            res.badRequest([res.__('invalidTypeRequest')]);
          }
          // IF user give the invlaid limit (like less than 1)
        } else {
          res.badRequest([res.__('invalidLimitRequest')]);
        }
      } else {
        if (condition != null) {
          const allUsers = await this.adminService
            .getUsersData(searchText, condition, limit)
            .catch((err: Error) => {
              res.serverError(err);
              throw err;
            });

          if (allUsers) {
            res.ok(allUsers);
          } else {
            res.noData();
          }
          //if user give the invalid type request
        } else {
          console.log('a1');
          res.badRequest([res.__('invalidTypeRequest')]);
        }
      }
    }
  }
}

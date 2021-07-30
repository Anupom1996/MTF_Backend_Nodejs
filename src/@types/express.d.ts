/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Express {
  interface Response {
    __: any;
    ok: any;
    created: any;
    badRequest: any;
    unAuthorized: any;
    noData: any;
    serverError: any;
    forbidden: any;
  }
  interface Request {
    token: string | null;
    userDetails: IUserRequestObject | null;
    adminDetails: IAdminRequestObject | null;
  }
}

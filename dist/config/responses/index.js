"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideResponse = void 0;
/**
 * This function is used for sending 200 response
 * @param req
 * @param res
 * @param next
 */
const ok = (req, res, next) => {
    res.ok = (data) => {
        const response = {
            status: 200,
            message: res.__('success'),
            data: data,
        };
        return res.send(response);
    };
    next();
};
/**
 * This function is used for sending 201 response
 * @param req
 * @param res
 * @param next
 */
const created = (req, res, next) => {
    res.created = (data) => {
        const response = {
            status: 201,
            message: res.__('created'),
            data: data,
        };
        return res.status(201).json(response);
    };
    next();
};
/**
 * This function is used for sending 204 response
 * @param req
 * @param res
 * @param next
 */
const noData = (req, res, next) => {
    res.noData = (data) => {
        const response = {
            status: 204,
            message: res.__('noDataFound'),
            data: data,
        };
        return res.status(200).json(response);
    };
    next();
};
/**
 * This function is used for sending 400 response
 * @param req
 * @param res
 * @param next
 */
const badRequest = (req, res, next) => {
    res.badRequest = (errors) => {
        const response = {
            status: 400,
            errors: errors,
        };
        return res.status(400).json(response);
    };
    next();
};
/**
 * This function is used for sending 401 response
 * @param req
 * @param res
 * @param next
 */
const unAuthorized = (req, res, next) => {
    res.unAuthorized = (message, reason = '') => {
        const response = {
            status: 401,
            message: message ? message : res.__('unAuthorizedAccess'),
            reason,
        };
        return res.status(401).json(response);
    };
    next();
};
/**
 * This function is used for sending 403 response
 * @param req
 * @param res
 * @param next
 */
const forbidden = (req, res, next) => {
    res.forbidden = (message) => {
        const response = {
            status: 403,
            message: message ? message : res.__('forbidden'),
        };
        return res.status(403).json(response);
    };
    next();
};
/**
 * This function is used for sending 500 response
 * @param req
 * @param res
 * @param next
 */
const serverError = (req, res, next) => {
    res.serverError = (err) => {
        const response = {
            status: 500,
            message: res.__('serverError'),
            err: err,
        };
        return res.status(500).json(response);
    };
    next();
};
exports.overrideResponse = [
    ok,
    created,
    noData,
    badRequest,
    unAuthorized,
    forbidden,
    serverError,
];
//# sourceMappingURL=index.js.map
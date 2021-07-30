"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = void 0;
/**
 * This function is used for validating X-API-KEY header
 * @param req
 * @param res
 * @param next
 */
exports.validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        if (process.env.API_KEY === apiKey) {
            next();
        }
        else {
            res.forbidden('');
        }
    }
    else {
        res.forbidden('');
    }
};
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
exports.validate = (req, res, next) => {
    const errors = express_validator_1.validationResult(req);
    if (errors.isEmpty()) {
        next();
    }
    else {
        const extractedErrors = [];
        errors.array().map((err) => extractedErrors.push(res.__(err.msg)));
        res.badRequest(extractedErrors);
    }
};
//# sourceMappingURL=index.js.map
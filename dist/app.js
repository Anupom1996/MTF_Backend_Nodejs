"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_bearer_token_1 = __importDefault(require("express-bearer-token"));
const path_1 = require("path");
const body_parser_1 = __importDefault(require("body-parser"));
const mongo_1 = require("@config/database/mongo");
const responses_1 = require("@config/responses");
const routes_1 = require("./routes");
const i18n = __importStar(require("i18n"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument = __importStar(require("@assets/swagger/swagger.json"));
const payment_1 = require("@controllers/payment");
class App {
    constructor() {
        this.paymentCtrl = new payment_1.PaymentController();
        this.app = express_1.default();
        this.overrideExpressResponse();
        this.initializeSwagger();
        this.initializeWebhook();
        this.initializeI18n();
        this.setHeaders();
        this.initializeMiddleware();
        this.initializeDBConnection();
        this.initializeRoutes();
    }
    /**
     * Initilization of internationalization(i18n)
     * default language english.
     */
    initializeI18n() {
        i18n.configure({
            locales: ['en'],
            directory: path_1.resolve(__dirname, './assets/locales'),
        });
        this.app.use(i18n.init);
    }
    /**
     * Initilization of API's documentation.
     * We used Swagger 3.
     */
    initializeSwagger() {
        this.app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    }
    /**
     * Initialize webhook for payment
     */
    initializeWebhook() {
        this.app.post('/webhook', body_parser_1.default.raw({ type: 'application/json' }), (req, res) => this.paymentCtrl.webhookController(req, res));
    }
    /**
     * All express middleware goes here
     * `body-parser` = parsing request body
     * `bearerToken` = For `Basic Auth` token
     */
    initializeMiddleware() {
        this.app.use(body_parser_1.default.json());
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
        this.app.use(express_bearer_token_1.default());
    }
    /**
     * Handaling database connection
     * In this application we are using only MongoDB with helper lib `mongoose`
     */
    initializeDBConnection() {
        mongo_1.connect();
    }
    /**
     * Basic header configuartion
     * It is recomanded to update this section, depending on application's needs.
     * Security Attention: Take a special care of `Allow-Origin` for production
     * `Access-Control-Allow-Origin` - * or forward request origin not recomanded in production
     */
    setHeaders() {
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');
            res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', '86400');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, accept-language, Authorization, x-api-key, password-token');
            next();
        });
    }
    /**
     * Overriding the express response.
     * Defination is in following path `src/config/responses`
     * ok = 200
     * created = 201
     * noData = 204
     * badRequest = 400
     * forbidden = 403
     * severError = 500
     */
    overrideExpressResponse() {
        responses_1.overrideResponse.forEach((customRes) => {
            this.app.use(customRes);
        });
    }
    /**
     * Initializing APIs base routes.
     * APIs base path also depends on server proxy configuration.
     */
    initializeRoutes() {
        this.app.use('/api/v1', routes_1.v1Router);
    }
}
/**
 * Export the application.
 * We made it singletone to avoid accidental double invokation.
 */
exports.default = new App().app;
//# sourceMappingURL=app.js.map
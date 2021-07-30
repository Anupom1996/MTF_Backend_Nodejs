import express, { Application, Request, Response, NextFunction } from 'express';
import bearerToken from 'express-bearer-token';
import { resolve } from 'path';
import bodyParser from 'body-parser';
import { connect as mongoConnect } from '@config/database/mongo';
import { overrideResponse } from '@config/responses';
import { v1Router } from './routes';

import * as i18n from 'i18n';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '@assets/swagger/swagger.json';
import { PaymentController } from '@controllers/payment';

class App {
  public app: Application;
  public paymentCtrl = new PaymentController();

  constructor() {
    this.app = express();
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
  private initializeI18n(): void {
    i18n.configure({
      locales: ['en'],
      directory: resolve(__dirname, './assets/locales'),
    });
    this.app.use(i18n.init);
  }

  /**
   * Initilization of API's documentation.
   * We used Swagger 3.
   */
  private initializeSwagger(): void {
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  /**
   * Initialize webhook for payment
   */
  private initializeWebhook(): void {
    this.app.post(
      '/webhook',
      bodyParser.raw({ type: 'application/json' }),
      (req: Request, res: Response) => this.paymentCtrl.webhookController(req, res),
    );
  }

  /**
   * All express middleware goes here
   * `body-parser` = parsing request body
   * `bearerToken` = For `Basic Auth` token
   */
  private initializeMiddleware(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bearerToken());
  }

  /**
   * Handaling database connection
   * In this application we are using only MongoDB with helper lib `mongoose`
   */
  private initializeDBConnection(): void {
    mongoConnect();
  }

  /**
   * Basic header configuartion
   * It is recomanded to update this section, depending on application's needs.
   * Security Attention: Take a special care of `Allow-Origin` for production
   * `Access-Control-Allow-Origin` - * or forward request origin not recomanded in production
   */
  private setHeaders(): void {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      res.header(
        'Access-Control-Allow-Headers',
        'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, accept-language, Authorization, x-api-key, password-token',
      );
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
  private overrideExpressResponse(): void {
    overrideResponse.forEach((customRes) => {
      this.app.use(customRes);
    });
  }

  /**
   * Initializing APIs base routes.
   * APIs base path also depends on server proxy configuration.
   */
  private initializeRoutes() {
    this.app.use('/api/v1', v1Router);
  }
}

/**
 * Export the application.
 * We made it singletone to avoid accidental double invokation.
 */
export default new App().app;

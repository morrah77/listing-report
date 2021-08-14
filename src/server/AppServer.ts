import createError from 'http-errors';
import e, {NextFunction, Request, Response} from 'express';
import path from 'path';
import morgan from 'morgan'
import lessMiddleware from 'less-middleware';
import cookieParser from 'cookie-parser';
import fileUpload from "express-fileupload"
import ReportRouter from '../routes/ReportRouter';
import Config from '../config/Config';
import ReportingService from '../services/ReportingService';
import {AddJsonContentTypeHeaders} from '../middlewares';
import IReportingService from '../services/IReportingService';
import DataUploadRouter from '../routes/DataUploadRouter';
import IReportDataUploadService from '../services/IReportDataUploadService';
import ReportDataUploadService from '../services/ReportDataUploadService';
import winston from 'winston';
import IReportRepository from '../repositories/IReportRepository';
import ReportRepository from '../repositories/ReportRepository';

export default class AppServer {
  private static API_VERSION: string = '0'
  private _express: e.Application;
  private config: Config;
  private logger: winston.Logger

  constructor(config: Config) {
    this.config = config;
    this._express = e();
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'AppServer'}
    });

    this._express.set('views', path.join(__dirname, '../views'));
    this._express.set('view engine', 'ejs');

    // TODO make Winston logger count request duration and get rid of Morgan
    this._express.use(morgan('dev'));
    // TODO move the Winston logger middleware to a separate file
    this._express.use(this.winstonLoggerHandler.bind(this));
    this._express.use(cookieParser());
    this._express.use(e.json());
    this._express.use(e.urlencoded({extended: false}));

    this._express.use(lessMiddleware(path.join(__dirname, '../public')));
    this._express.use(e.static(path.join(__dirname, '../public')));

    this._express.use(`v/${AppServer.API_VERSION}`, AddJsonContentTypeHeaders);

    this._express.use(fileUpload({
      useTempFiles : true,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      abortOnLimit: true
    }));

    let reportRepository: IReportRepository = ReportRepository.getInstance(this.config)
    let reportingService: IReportingService = ReportingService.getInstance(this.config, reportRepository);
    // TODO move all the routers into an array and apply API varsion prefix to all of them at one time
    this._express.use(`/v${AppServer.API_VERSION}/report`, new ReportRouter(reportingService).router);

    let reportDataUploadService: IReportDataUploadService = ReportDataUploadService.getInstance(this.config)
    this._express.use(`/v${AppServer.API_VERSION}/data`, new DataUploadRouter(reportDataUploadService).router);

    this._express.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    this._express.use(function(err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: { locals: { message: any; error: any; }; status: (arg0: any) => void; render: (arg0: string) => void; }, next: any) {

      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'dev' ? err : {};

      res.status(err.status || 500);
      res.render('error');
    });

    this._express.set('port', config.server.port);
  }

  private winstonLoggerHandler(req: Request, res: Response, next: NextFunction): void {
    this.logger.info(`Processing a request: ${req.method} ${req.url}`, {method: req.method, url: req.url, query: req.query, params: req.params})
    next()
  }

  get express(): e.Application {
    return this._express;
  }
}

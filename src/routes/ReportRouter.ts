import {NextFunction, Request, Response, Router} from 'express';
import IReportingService from '../services/IReportingService';
import winston from 'winston'
import {parseStringOrUndefined} from '../utils/ParamParserUtil'
import Error from '../models/errors/Error';
import {VaidateRequest} from '../middlewares'
import Config from '../config/Config';

export default class ReportRouter {
  private _router: Router;
  private logger: winston.Logger;
  private IReportingService: IReportingService;
  private config: Config

  constructor(ReportingService: IReportingService) {
    this._router = Router({mergeParams: true});
    this.config = Config.getInstance();
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'ReportRouter'}
    });
    this.IReportingService = ReportingService;

    // TODO generalize all the methods
    this._router.get('/avg_selling_prices', VaidateRequest, this.handleGetAvgSellingPrices.bind(this));
    this._router.get('/make_distributions', VaidateRequest, this.handleGetMakeDistribution.bind(this));
    this._router.get('/avg_price', VaidateRequest, this.handleGetAvgPrice.bind(this));
    this._router.get('/ranked_listings', VaidateRequest, this.handleGetRankedListings.bind(this));
  }

  private handleGetAvgSellingPrices(req: Request, res: Response, next: NextFunction): void {
    this.logger.debug(`handleGetAvgSellingPrices: ${req.url}`)
    const respondWithJson: string|undefined = parseStringOrUndefined(req.query.json);
    this.IReportingService.getAvgSellingPrices()
      .then(result => {
        this.logger.debug(`Got result: `, result);
        if (result) {
          if (respondWithJson) {
            res.json(result);
          } else {
            res.contentType("text/html; charset=utf-8")
            res.render('Report', {title: 'Average Listing Selling Price per Seller Type', modelName: 'AvgSellingPrice', models: result})
          }
          return;
        }
        next();
      })
      .catch(e => {
        this.logger.error(e);
        res.status(500);
        res.json(new Error(500, 'internal server error'))
      });
  }

  private handleGetMakeDistribution(req: Request, res: Response, next: NextFunction): void {
    this.logger.debug(`handleGetMakeDistribution: ${req.url}`)
    const respondWithJson: string|undefined = parseStringOrUndefined(req.query.json);
    this.IReportingService.getMakeDistributions()
      .then(result => {
        this.logger.debug(`Got result: `, result);
        if (result) {
          if (respondWithJson) {
            res.json(result);
          } else {
            res.contentType("text/html; charset=utf-8")
            res.render('Report', {title: 'Percentual distribution of available cars by Make', modelName: 'MakeDistribution', models: result})
          }
          return;
        }
        next();
      })
      .catch(e => {
        this.logger.error(e);
        res.status(500);
        res.json(new Error(500, 'internal server error'))
      });
  }

  private handleGetAvgPrice(req: Request, res: Response, next: NextFunction): void {
    this.logger.debug(`handleGetAvgPrice: ${req.url}`)
    const respondWithJson: string|undefined = parseStringOrUndefined(req.query.json);
    this.IReportingService.getAvgPrice()
      .then(result => {
        this.logger.debug(`Got result: `, result);
        if (result) {
          if (respondWithJson) {
            res.json(result);
          } else {
            res.contentType("text/html; charset=utf-8")
            res.render('Report', {title: 'Average price of the 30% most contacted listings', modelName: 'AvgPrice', models: new Array(result)})
          }
          return;
        }
        next();
      })
      .catch(e => {
        this.logger.error(e);
        res.status(500);
        res.json(new Error(500, 'internal server error'))
      });
  }

  private handleGetRankedListings(req: Request, res: Response, next: NextFunction): void {
    this.logger.debug(`handleGetRankedListings: ${req.url}`)
    const respondWithJson: string|undefined = parseStringOrUndefined(req.query.json);
    this.logger.debug(`respondWithJson: ${respondWithJson}`)
    this.IReportingService.getRankedListings()
      .then(result => {
        this.logger.debug(`Got result: `, result);
        console.dir(req.params)
        console.dir(req.query)
        if (result) {
          if (respondWithJson) {
            res.json(result);
          } else {
            res.contentType("text/html; charset=utf-8")
            res.render('Report', {title: 'The Top 5 most contacted listings per Month', modelName: 'RankedListing', models: result})
          }
          return;
        }
        next();
      })
      .catch(e => {
        this.logger.error(`error: ${e}`);
        res.status(500);
        res.json(new Error(500, 'internal server error'))
      });
  }

  get router(): Router {
    return this._router;
  }
}

import {NextFunction, Request, Response, Router} from 'express';
import winston from 'winston'
import {parseStringOrUndefined} from '../utils/ParamParserUtil'
import Error from '../models/errors/Error';
import {VaidateRequest} from '../middlewares'
import IReportDataUploadService from '../services/IReportDataUploadService';
import Config from '../config/Config';
import Listing from '../models/raw/Listing';
import {StringIndexedVar} from '../common/StringIndexedAny';
import Contact from '../models/raw/Contact';
import OperationResult from '../models/OperationResult';

export default class DataUploadRouter {
  private _router: Router
  private logger: winston.Logger
  private config: Config
  private allowedReqestFiles: string[]
  private iReportDataUploadService: IReportDataUploadService

  constructor(iReportDataUploadService: IReportDataUploadService) {
    this._router = Router({mergeParams: true});
    this.config = Config.getInstance();
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'ReportRouter'}
    });
    this.allowedReqestFiles = ['listings', 'contacts']
    this.iReportDataUploadService = iReportDataUploadService;

    this._router.get('/upload', VaidateRequest, this.handleDataUpload.bind(this));
    this._router.post('/upload', VaidateRequest, this.handleDataUpload.bind(this));
  }

  private handleDataUpload(req: Request, res: Response, next: NextFunction): void {
      this.logger.debug(`handleDataUpload: url: ${req.url}, files: ${req.files}`, req.files)
    const respondWithJson: string|undefined = parseStringOrUndefined(req.query.json);

    if (!req.files || ((!req.files.listings) && (!req.files.contacts))) {
        DataUploadRouter.renderForm([], res)
        return;
    }

    let validationResults: StringIndexedVar = this.iReportDataUploadService.validateFileContents(this.allowedReqestFiles, {listings: Listing.isListing, contacts: Contact.isContact}, req.files)
    this.logger.debug(`validationResults: ${validationResults.toString()}`, {validationResults})

    let uploadResults: OperationResult[] = []
    let filesToUpload: string[] = []

    for (let fileName of this.allowedReqestFiles) {
      if (validationResults[fileName] !== "OK") {
        uploadResults.push(new OperationResult('error', validationResults[fileName] as string))
        continue;
      }
      filesToUpload.push(fileName)
    }

    if (!filesToUpload.length) {
      let error: any = new OperationResult('error', 'No files were uploaded!')
      uploadResults.push(error)
      DataUploadRouter.renderForm(uploadResults, res)
      return
    }

    this.iReportDataUploadService.upload(filesToUpload, req.files)
      .then(result => {
        uploadResults.push(result)
        if (respondWithJson) {
          res.json(uploadResults);
        } else {
          DataUploadRouter.renderForm(uploadResults, res)
        }
        })
      .catch(e => {
        this.respondWithError(500, "Internal server error", Boolean(respondWithJson), res, next)
      })
  }

  private static renderForm(messages: OperationResult[], res: Response) {
    res.contentType("text/html; charset=utf-8")
    res.render('Upload', {title: 'Please upload your data', messages})
  }

  private respondWithError(code: number, message: string, respondWithJson: boolean, res: Response, next: Function): void {
    this.logger.error(message)
    res.status(code)
    if (respondWithJson) {
      res.json(new Error(code, message))
    } else {
      let errors: any[] = [new OperationResult('error', message)]
      DataUploadRouter.renderForm(errors, res)
    }
  }

  get router(): Router {
    return this._router;
  }
}
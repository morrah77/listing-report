import IReportDataUploadService from './IReportDataUploadService';
import Config from '../config/Config';
import winston from 'winston';
import {StringIndexedAny, StringIndexedVar} from '../common/StringIndexedAny';
import fileUpload, {FileArray, UploadedFile} from 'express-fileupload';
import {readFileSync} from 'fs';
import path from 'path';
import parse from 'csv-parse/lib/sync';
import OperationResult from '../models/OperationResult';


export default class ReportDataUploadService implements IReportDataUploadService {
  private logger: winston.Logger
  private config: Config
  private static instance: ReportDataUploadService

  private constructor(config: Config) {
    this.config = config;
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'ReportDataUploadService'}});
  }
  validateFileContents(fileNames: string[], validators: StringIndexedAny, files: FileArray): StringIndexedVar {
    this.logger.debug(`validateFileContents`, {files, fileNames, validators})
    let result:StringIndexedVar = {}

    for (let fileName of fileNames) {
      if (!files || !files[fileName]) {
        result[fileName] = `No ${fileName} file was found in the request files!`
        continue
      }

      let uploadedFile: fileUpload.UploadedFile | fileUpload.UploadedFile[] = files[fileName] as UploadedFile

      let dataContents = readFileSync(path.resolve(uploadedFile.tempFilePath), {encoding: 'utf-8'})
      if (!dataContents) {
        result[fileName] = `No ${fileName} file was uploaded!`
        continue
      }

      let dataObject: Array<any> = parse(dataContents, {columns: true}) as Array<any>
      if (!dataObject) {
        result[fileName] = `Could not parse ${fileName} file!`
        continue
      }

      let invalidLineNumber: number = -1;
      let checkResult = dataObject.some((v, i) => {
        if (!validators[fileName](v)) {
          this.logger.debug(`Validation error: ${fileName}, ${i}`, {fileName, validators, v})
          invalidLineNumber = i
          return true
        }
        return false
      })
      if (checkResult) {
        result[fileName] = `An invalid data found in the line ${invalidLineNumber} in the ${fileName} file!`
        continue
      }
      result[fileName] = 'OK'
    }
    return result
  }

  upload(fileNames: string[], files: FileArray): Promise<OperationResult> {
    let uploads: Array<Promise<void>> = new Array<Promise<void>>()

    for (let fileName of fileNames) {
      if (!(fileName in files)) {
        continue
      }
      let upload: fileUpload.UploadedFile | fileUpload.UploadedFile[] = files[fileName] as UploadedFile
      let dataPath = `${this.config.feeds.path}/${fileName}.csv`;
      uploads.push(upload.mv(dataPath))
    }

    if (!uploads.length) {
      let error: any = new OperationResult('error', 'No files were uploaded!')
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }
    return Promise.all(uploads)
      .then(() => {
        let error: any = new OperationResult('success', 'Files are saved!')
        return error
      })
  }

  static getInstance(config?: Config) {
    if (!this.instance && config) {
      this.instance = new ReportDataUploadService(config);
    } else {
      throw new Error("Existing instance re-initialization is prohibited!")
    }
    return this.instance;
  }

}
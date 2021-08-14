import winston from 'winston';
import Config from '../config/Config';
import path from 'path';
import {readFileSync} from 'fs';
import parse from 'csv-parse/lib/sync'
import IReportRepository from './IReportRepository';

export default class ReportRepository implements IReportRepository{
  private logger: winston.Logger;
  private config: Config;
  private static instance: ReportRepository;

  private constructor(config: Config) {
    this.config = config;
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'ReportRepository'}
    });
  }

  // TODO Consider making it async
  public getData(fileName: string): Promise<Array<any>> {
    this.logger.debug(`Getting data`)
    return new Promise<Array<any>>((resolve, reject) => {
      let dataPath = `${this.config.feeds.path}/${fileName}.csv`;
      this.logger.debug(`dataPath: ${dataPath}`)
      let dataContents = readFileSync(path.resolve(dataPath), {encoding: 'utf-8'});
      if (!dataContents) {
        reject();
      }
      let dataObject = parse(dataContents, {columns: true});
      if (!dataObject) {
        reject();
      }
      resolve(dataObject);
    })
  }

  static getInstance(config?: Config) {
    if (!this.instance && config) {
      this.instance = new ReportRepository(config);
    } else {
      throw new Error("Existing instance re-initialization is prohibited!")
    }
    return this.instance;
  }
}
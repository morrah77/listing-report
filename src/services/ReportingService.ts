import Config from '../config/Config';
import winston from 'winston';
import IReportingService from './IReportingService';
import AvgSellingPrice from '../models/AvgSellingPrice';
import MakeDistribution from '../models/MakeDistribution';
import AvgPrice from '../models/AvgPrice';
import RankedListing from '../models/RankedListing';
import StringIndexedObject from '../common/StringIndexedObject';
import MonthlyRankedListings from '../models/MonthlyRankedListings';
import {StringIndexedVar} from '../common/StringIndexedAny';
import IReportRepository from '../repositories/IReportRepository';


export default class ReportingService implements IReportingService {
  private config: Config
  private logger: winston.Logger;
  private repository: IReportRepository;
  private static instance: ReportingService;

  private constructor(config: Config, iReporRepository: IReportRepository) {
    this.config = config;
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
      level: this.config.log,
      defaultMeta: {source: 'ReportingService'}
    });
    this.repository = iReporRepository;
  }

  public getAvgSellingPrices(): Promise<Array<AvgSellingPrice>|void> {
    this.logger.debug(`getAvgSellingPrices`)
    return this.repository.getData('listings')
      .then((res: Array<any>) => {
        this.logger.debug(`Got data. A sample is: ${res[0]}`, {sample: res[0]})
        if (!res) {
          res = []
        }
        let aggregatedResult: StringIndexedObject = res?.reduce((acc, row, ind, res) => {
            if (!acc[row['seller_type']]) {
              acc[row['seller_type']] = {count:0, amount:0}
            }
            acc[row['seller_type']].count += 1
            acc[row['seller_type']].amount += (Number(row['price']))
            return acc
          },
          {}) as StringIndexedObject
        this.logger.debug(`aggregatedResult`, {aggregatedResult})
        return Object.getOwnPropertyNames(aggregatedResult)
          .map(sellerTypeName => new AvgSellingPrice(
            sellerTypeName,
            Math.round(((aggregatedResult[sellerTypeName] as {count:number, amount:number}).amount / (aggregatedResult[sellerTypeName] as {count:number, amount:number}).count * 100) / 100)))
      })
      .catch(e => {
        this.logger.debug(`error: ${e}`, {error: e});
        throw(e);
      });
  }

  public getMakeDistributions(): Promise<Array<MakeDistribution>|void> {
    this.logger.debug(`getMakeDistributions`)
    return this.repository.getData('listings')
      .then((res: Array<any>) => {
        this.logger.debug(`Got data. A sample is: ${res[0]}`, {sample: res[0]})
        let aggregatedResult: StringIndexedObject = res.reduce((acc, row, ind, res) => {
            if (!acc[row['make']]) {
              acc[row['make']] = {count:0, amount:0}
            }
            acc[row['make']].count += 1
            return acc
          },
          {}) as StringIndexedObject
        return Object.getOwnPropertyNames(aggregatedResult)
          .map(makeName => new MakeDistribution(
            makeName,
            Math.round((aggregatedResult[makeName] as {count:number, amount:number}).count / res.length * 100)))
      })
      .catch(e => {
        this.logger.debug(`error: ${e}`, {error: e});
        throw(e);
      });
  }

  public getAvgPrice(): Promise<AvgPrice|void> {
    this.logger.debug(`getAvgPrice`)
    return this.repository.getData('listings')
      .then((res: Array<any>) => {
        this.logger.debug(`Got data. A sample is: ${res[0]}`, {sample: res[0]})
        let aggregatedPrice = res.reduce((acc, row, ind, res) => {
            acc += (Number(row['price']))
            return acc
          },
          0) as number
        return new AvgPrice(
          Math.round(aggregatedPrice / res.length))
      })
      .catch(e => {
        this.logger.debug(`error: ${e}`, {error: e});
        throw(e);
      });
  }

  public getRankedListings(): Promise<Array<MonthlyRankedListings>|void>{
    this.logger.debug(`getRankedListings`)
    let data = new Array<Promise<Array<any>>>()
    data.push(this.repository.getData('listings'), this.repository.getData('contacts'))
    return Promise.all(data)
      .then((res: Array<Array<any>>) => {
        this.logger.debug(`Got listings data: ${res[0].length} items. A sample is: ${res[0]}`, {sample: res[0]})
        this.logger.debug(`Got contacts data: ${res[1].length} items. A sample is: ${res[1]}`, {sample: res[1]})
        let contactResult = res.pop() as Array<any>
        let listingResult = res.pop() as Array<any>

        let aggregatedResult: StringIndexedObject = contactResult.reduce((acc, row) => {
            let contactDate = new Date(Number(row['contact_date']))
            let contactMonthDate = new Date(contactDate.getFullYear(), contactDate.getMonth()).getTime().toString()
            if (!acc[contactMonthDate]) {
              acc[contactMonthDate] = {}
            }
            if (!acc[contactMonthDate][row['listing_id']]) {
              acc[contactMonthDate][row['listing_id']] = 0
            }
            acc[contactMonthDate][row['listing_id']] += 1
            return acc
          },
          {}) as StringIndexedObject
        this.logger.debug(`aggregatedResult (${Object.getOwnPropertyNames(aggregatedResult).length} items):`)
        return (Object.getOwnPropertyNames(aggregatedResult)
          .map(aggregatedMonth => {
            let contactedPerMonth = Object.getOwnPropertyNames(aggregatedResult[aggregatedMonth])
              .map(listingId => {return {listing_id: listingId, count: (Number((aggregatedResult[aggregatedMonth] as StringIndexedObject)[listingId]))}}) as Array<{listing_id: string, count: number}>

            let mostContactedPerMonth = contactedPerMonth
              .sort((a, b) => b.count - a.count)
              .filter((v, i) => i < 5)

            let listings = mostContactedPerMonth.map((v, ind) => {
              let d: StringIndexedVar = listingResult.find((e, i) => {
                return e['id'] == v.listing_id
              });
              if (!d) {
                this.logger.debug(`Not found a listing for id=${v.listing_id} in ${listingResult.length} listings!`, {listing: d})
                d = {make: 'N/A', price: 0, mileage: 0} as StringIndexedVar
              }
              return new RankedListing(
                ind + 1,
                Number(v.listing_id),
                String(d['make']),
                Number(d['price']),
                Number(d['mileage']),
                v.count)}) as Array<RankedListing>

            return new MonthlyRankedListings(aggregatedMonth, listings)
          }) as Array<MonthlyRankedListings>)
          .sort((a: MonthlyRankedListings, b: MonthlyRankedListings) => Number(a.month) - Number(b.month))
          .map((v: MonthlyRankedListings) => {v.month = new Date(Number(v.month)).toString(); return v})
      })
      .catch(e => {
        this.logger.debug(`error: ${e}`, {error: e});
        throw(e);
      });
  }

  static getInstance(config?: Config, iReportRepository?: IReportRepository) {
    if (!this.instance && config && iReportRepository) {
      this.instance = new ReportingService(config, iReportRepository);
    } else {
      throw new Error("Existing instance re-initialization is prohibited!")
    }
    return this.instance;
  }
}
import e from 'express';
import {agent as request} from 'supertest';
import ReportRouter from './ReportRouter'
import IReportingService from '../services/IReportingService';
import AvgPrice from '../models/AvgPrice';
import AvgSellingPrice from '../models/AvgSellingPrice';
import MakeDistribution from '../models/MakeDistribution';
import MonthlyRankedListings from '../models/MonthlyRankedListings';

// TODO cover the rest of router methods
describe('ReportRouter', () => {

  describe('/avg_price', () => {
  it('Should respond with HTTP status code 200 and expected response when no error from service', (done) => {
    let ReportingServiceMock: IReportingService = RouterSpecHelper.createReportingServiceMock(
      RouterSpecHelper.avgPriceFromJSON(RouterSpecHelper.avgPrice1JSON),
      undefined,
      [],
      undefined);
    let movieRouter: ReportRouter = new ReportRouter(ReportingServiceMock);
    let app: e.Application = e();
    app.use('/report', movieRouter.router);
    request(app).get('/report/avg_price?json=true')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(RouterSpecHelper.avgPrice1JSON)
      .expect(200, done);
  }),

    it('Should respond with HTTP status code 500 and expected error when error from service', (done) => {
      let ReportingServiceMock: IReportingService = RouterSpecHelper.createReportingServiceMock(
        undefined,
        new Error("Something went wrong"),
        [],
        undefined);
      let movieRouter: ReportRouter = new ReportRouter(ReportingServiceMock);
      let app: e.Application = e();
      app.use('/report', movieRouter.router);
      request(app).get('/report/avg_price?json=true')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"status":500,"message":"internal server error"}')
        .expect(500, done);
    }),

    it('Should respond with HTTP status code 404 and expected error when no result from service', (done) => {
      let ReportingServiceMock: IReportingService = RouterSpecHelper.createReportingServiceMock(
        undefined,
        undefined,
        [],
        undefined);
      let movieRouter: ReportRouter = new ReportRouter(ReportingServiceMock);
      let app: e.Application = e();
      app.use('/report', movieRouter.router);
      request(app).get('/report/avg_price?json=true')
        .expect(404, done);
    })
  })
})

class RouterSpecHelper {
  static avgPrice1JSON: string = '{"price":42}';

  static movie2JSON: string = '{"id":39,"title":"My Movie 39","description":"Descr 39","short_description":"Short descr 39","duration":20753,"release_date":"1951-07-25T10:50:16.000Z","genres":["Science Fiction","Comedy"],"images":null}'

  static createReportingServiceMock(
    singleResult: void|AvgPrice|AvgSellingPrice|MakeDistribution|MonthlyRankedListings,
    singleError: void|Error,
    listResult: void|Array<AvgPrice>|Array<AvgSellingPrice>|Array<MakeDistribution>|Array<MonthlyRankedListings>,
    listError: void|Error): IReportingService {
    return  new class implements IReportingService {
      getAvgPrice(): Promise<void | AvgPrice> {
        return new Promise((resolve, reject) => {
          if(singleError) {
            reject(singleError);
            return;
          }
          resolve(singleResult as AvgPrice)});
      }

      getAvgSellingPrices(): Promise<Array<AvgSellingPrice>|void> {
        return new Promise((resolve, reject) => {
          if(listError) {
            reject(listError);
            return;
          }
          resolve(listResult as Array<AvgSellingPrice>)
        });
      }

      getMakeDistributions(): Promise<void|Array<MakeDistribution>> {
        return new Promise((resolve, reject) => {
          if(listError) {
            reject(listError);
            return;
          }
          resolve(listResult as Array<MakeDistribution>)
        });
      }

      getRankedListings(): Promise<void|Array<MonthlyRankedListings>> {
        return new Promise((resolve, reject) => {
          if(listError) {
            reject(listError);
            return;
          }
          resolve(listResult as Array<MonthlyRankedListings>)
        });
      }
    }
  }

  static avgPriceFromJSON(json: string): AvgPrice {
    return JSON.parse(json);
  }
}
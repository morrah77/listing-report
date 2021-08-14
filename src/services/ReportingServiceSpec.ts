import ReportingService from './ReportingService';
import Config from '../config/Config';
import IReportRepository from '../repositories/IReportRepository';
import AvgSellingPrice from '../models/AvgSellingPrice';

// TODO Add more tests
describe("ReportingService", () => {
  it("Should return a list of models when repository responds with valid data set", (done) => {
    let config: Config = Config.getInstance()
    let data: Array<any> = [
      {seller_type: 'one', price: 5},
      {seller_type: 'one', price: 10},
      {seller_type: 'one', price: 15},
      {seller_type: 'two', price: 25},
      {seller_type: 'two', price: 15},
      {seller_type: 'two', price: 2},
      {seller_type: 'two', price: 30},
      {seller_type: 'two', price: 28}
    ]
    let expectedResult: Array<AvgSellingPrice> = [
      new AvgSellingPrice("one", 10),
      new AvgSellingPrice("two", 20)
    ]
    let repository: IReportRepository = ReportingServiceSpecHelper.createReportRepositoryMock(data, undefined)
    let reportService: ReportingService = ReportingService.getInstance(config, repository)
    reportService.getAvgSellingPrices()
      .then(result => {
        expect(result).toEqual(expectedResult)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })

  })
})

class ReportingServiceSpecHelper {
  public static createReportRepositoryMock(result: void|Array<any>, error: void|Error): IReportRepository {
    return new class implements IReportRepository {
      getData(fileName: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
          if(error) {
            reject(error);
            return;
          }
          resolve(result as Array<any>)
        })
      }
    }
  }
}
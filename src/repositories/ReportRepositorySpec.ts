import Config from '../config/Config';
import ReportRepository from './ReportRepository';
import IReportRepository from './IReportRepository';

describe('ReportRepository', () => {
  let reportRepository: IReportRepository
  let config: Config = Config.getInstance()

  beforeAll(() => {
    reportRepository = ReportRepository.getInstance(config)
  })

  it('Should return a list of object when a file exists and can be parsed', (done) => {
    config.feeds.path = './test_data'
    let expectedResult: Array<any> = [
      {listing_id: '1000', contact_date: '1592498493000'},
      {listing_id: '1000', contact_date: '1582474057000'},
      {listing_id: '1000', contact_date: '1579365755000'},
      {listing_id: '1000', contact_date: '1585159440000'},
      {listing_id: '1001', contact_date: '1583574198000'},
      {listing_id: '1002', contact_date: '1586674958000'},
      {listing_id: '1002', contact_date: '1588390278000'},
      {listing_id: '1002', contact_date: '1584070396000'},
      {listing_id: '1188', contact_date: '1588508838000'},
      {listing_id: '1257', contact_date: '1581408419000'},
    ]

    reportRepository.getData('contacts_1')
      .then(res => {
        expect(res).toEqual(expectedResult)
        done()
      })
      .catch(err => {
        fail(err)
        done()
      })
  }),

  it('Should throw an error when a file does not exist', (done) => {
    config.feeds.path = './test_data'
    let expectedError: RegExp = new RegExp(`^Error: ENOENT: no such file or directory`)
    reportRepository.getData('inexistent')
      .then(res => {
        fail(`An unexpected result has been returned: ${res}`)
        done()
      })
      .catch(err => {
        expect(err).toMatch(expectedError)
        done()
      })
  })
})
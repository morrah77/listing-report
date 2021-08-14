export default interface IReportRepository {
  getData(fileName: string): Promise<Array<any>>
}
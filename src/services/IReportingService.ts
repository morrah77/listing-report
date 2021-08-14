import AvgSellingPrice from '../models/AvgSellingPrice';
import MakeDistribution from '../models/MakeDistribution';
import AvgPrice from '../models/AvgPrice';
import MonthlyRankedListings from '../models/MonthlyRankedListings';

export default interface IReportingService {
  getAvgSellingPrices(): Promise<Array<AvgSellingPrice> | void>;
  getMakeDistributions(): Promise<void | Array<MakeDistribution>>;
  getAvgPrice(): Promise<void | AvgPrice>;
  getRankedListings(): Promise<void | Array<MonthlyRankedListings>>;
}
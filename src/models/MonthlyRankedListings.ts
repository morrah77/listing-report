import RankedListing from './RankedListing';

export default class MonthlyRankedListings {
  month: string;
  listings: Array<RankedListing>;
  public constructor(month: string, listings: Array<RankedListing>) {
    this.month = month
    this.listings = listings
  }
}
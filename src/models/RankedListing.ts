export default class RankedListing {
  ranking: number;
  listingId: number;
  make: String;
  price: number;
  mileage: number;
  totalContacts: number;
  constructor(ranking: number, listingId: number, make: string, price: number, mileage: number, totalContacts: number) {
    this.ranking = ranking;
    this.listingId = listingId;
    this.make = make;
    this.price = price;
    this.mileage = mileage;
    this.totalContacts = totalContacts;
  }
}
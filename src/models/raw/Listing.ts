import {StringIndexedVar} from '../../common/StringIndexedAny';

export default class Listing{
  id: string;
  make: string;
  price: Number;
  mileage: Number;
  seller_type: string;
  [index: string]: number | string | object | void;

  public constructor(id: string, make: string, price: Number, mileage: Number, seller_type: string) {
    this.id = id
    this.make = make
    this.price = price
    this.mileage = mileage
    this.seller_type = seller_type
  }

  public static isListing(value: StringIndexedVar): value is Listing {
    return (
      ("id" in value) && (typeof value["id"] == "string") &&
      ("make" in value) && (typeof value["make"] == "string") &&
      ("price" in value) && (typeof value["price"] == "string") &&
      ("mileage" in value) && (typeof value["mileage"] == "string") &&
      ("seller_type" in value) && (typeof value["seller_type"] == "string")
    )
  }
}
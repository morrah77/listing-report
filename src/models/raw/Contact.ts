import {StringIndexedVar} from '../../common/StringIndexedAny';

export default class Contact {
  listing_id: string;
  contact_date: string;
  [index: string]: number | string | object | void;

  public constructor(listing_id: string, contact_date: string) {
    this.listing_id = listing_id;
    this.contact_date = contact_date;
  }

  public static isContact(value: StringIndexedVar): value is Contact {
    return (
      ("listing_id" in value) && (typeof value["listing_id"] == "string") &&
      ("contact_date" in value) && (typeof value["contact_date"] == "string")
    )
  }
}
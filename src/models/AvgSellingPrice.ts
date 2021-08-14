export default class AvgSellingPrice {
  type: string;
  price: number;
  constructor(type: string, price: number) {
    this.type = type;
    this.price = price;
  }
}
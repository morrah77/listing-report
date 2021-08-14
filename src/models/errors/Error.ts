export default class Error {
  public status: number;
  public message: string;
  constructor(statusCode: number, message: string) {
    this.status = statusCode;
    this.message = message;
  }
}
export default class OperationResult {
  messageType: string;
  message: string;
  [index: string]: string;
  public constructor(messageType: string, message: string) {
    this.messageType = messageType;
    this.message = message;
  }
}
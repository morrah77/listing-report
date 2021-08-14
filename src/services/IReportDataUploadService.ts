import {StringIndexedAny, StringIndexedVar} from '../common/StringIndexedAny';
import {FileArray} from 'express-fileupload';
import OperationResult from '../models/OperationResult';

export default interface IReportDataUploadService {
  validateFileContents(fileNames: string[], validators: StringIndexedAny, files: FileArray): StringIndexedVar
  upload(fileNames: string[], files: FileArray): Promise<OperationResult>;
}
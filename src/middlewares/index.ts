import {NextFunction, Request, Response} from 'express';

export const AddJsonContentTypeHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.contentType("application/json; charset=utf-8");next();
};

// TODO consider implementing common req validator
export const VaidateRequest = (req: Request, res: Response, next: NextFunction) => {
  next();
};

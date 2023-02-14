import { NextFunction, Request, Response } from 'express';
import { AppError } from './interface.js';

export const getEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing: process.env['${name}'].`);
  }

  return value;
};

export const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log(`${request.method} url:: ${request.url}`);
  next();
};

export const errorLogger = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.log(`Error: ${error.message}`);
  next(error); // calling next middleware
};

export const errorResponder = (
  error: AppError,
  request: Request,
  response: Response,
) => {
  response.setHeader('Content-Type', 'application/json');
  const status = error.statusCode || 400;
  response.status(status).send(error.message);
};

export const invalidPathHandler = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  response.status(404);
  response.send('invalid path');
};

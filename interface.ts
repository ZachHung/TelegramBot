export interface INotionPage {
  name: string;
  username: string;
  password: string;
  date: string;
  duration: string;
  slotName: string;
}
export interface IUser extends INotionPage {
  id: string;
}

export interface SessionData {
  favoriteIds: string[];
}

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = Error.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

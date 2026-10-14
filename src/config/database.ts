import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class HttpError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpResponse {
  constructor(message: string, id?: any) {
    return {
      message,
      id,
    };
  }
}

export interface LoginPayload {
  token: string;
  user?: any;
}

export class LoginResponse {
  message: string;
  payload: LoginPayload;
  constructor(message: string, _payload: LoginPayload) {
    this.payload = _payload;
    this.message = message;
  }
}

export class GetMeResponse {
  message: string;
  user: any;
  constructor(message: string, _user: any) {
    this.message = message;
    this.user = _user;
  }
}

// Current directory I am in.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Where db.sqlite resides in.
const dbPath = path.resolve(__dirname, "../../db.sqlite");

const db = new DatabaseSync(dbPath);

export default db;

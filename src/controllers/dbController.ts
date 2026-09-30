import { DatabaseSync, StatementSync } from "node:sqlite";
import { HttpError } from "../config/database";

export interface User {
  type: "company" | "driver";
  photoURL: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  companyID: number | null;
  phoneNumber: string;
  email: string;
  password: string;
}

export function newUser(db: DatabaseSync, data: User) {
  const existingUser = db.prepare("SELECT * FROM users WHERE email = ?");
  if (existingUser) {
    throw new HttpError("Email or password already exists!", 400);
  }

  const insert: StatementSync = db.prepare(
    "INSERT INTO users (type, photoURL, firstName, lastName, companyName, companyID, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  db.exec("BEGIN TRANSACTION;");

  try {
    insert.run(
      data.type,
      data.photoURL,
      data.firstName,
      data.lastName,
      data.companyName,
      data.companyID,
      data.phoneNumber,
      data.email,
      data.password,
    );
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError("Internal Server Error", 500);
  }
}

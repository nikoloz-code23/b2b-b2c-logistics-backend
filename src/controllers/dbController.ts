import {
  DatabaseSync,
  StatementResultingChanges,
  StatementSync,
} from "node:sqlite";

import { HttpError, HttpResponse } from "../config/database";

export interface UserData {
  photoURL: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  companyID: number | null;
  phoneNumber: string;
  password: string;
  email: string;
}

export interface User extends UserData {
  type: "company" | "driver";
}

export function newUser(db: DatabaseSync, data: User) {
  const insert: StatementSync = db.prepare(
    "INSERT INTO users (type, photoURL, firstName, lastName, companyName, companyID, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING userId",
  );

  db.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    const existingUser = db
      .prepare("SELECT 1 FROM users WHERE email = ?")
      .get(data.email);

    if (existingUser) {
      throw new HttpError("User with this Email already exists!", 400);
    }

    const result = insert.get(
      data.type,
      data.photoURL,
      data.firstName,
      data.lastName,
      data.companyName,
      data.companyID,
      data.phoneNumber,
      data.email,
      data.password,
    ) as { userId: string } | undefined;

    db.exec("COMMIT;");

    return new HttpResponse(
      "User has been succesfully register.",
      result?.userId,
    );
  } catch (error) {
    db.exec("ROLLBACK;");
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError("Internal Server Error", 500);
  }
}

export function updateUser(db: DatabaseSync, data: UserData, id: number) {
  const existingUser = db
    .prepare(
      "UPDATE users SET photoURL=?, firstName=?, lastName=?, companyName=?, companyID=?, phoneNumber=?, password=? WHERE userId=? RETURNING userId",
    )
    .get(
      data.photoURL,
      data.firstName,
      data.lastName,
      data.companyName,
      data.companyID,
      data.phoneNumber,
      data.password,
      id,
    );

  return new HttpResponse(
    "User has been succesfully edited.",
    existingUser?.userId,
  );
}

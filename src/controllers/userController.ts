import { DatabaseSync, StatementSync } from "node:sqlite";

import { HttpError, HttpResponse, LoginResponse } from "../config/database";
import { User, UserData, LoginRequest, OverviewUserData } from "../types/user";
import { CompanyDriver } from "../types/driver";
import { JWT_SECRET } from "../../env";
import jwt from "jsonwebtoken";

export function newUser(db: DatabaseSync, data: User) {
  const insert: StatementSync = db.prepare(
    "INSERT INTO users (type, photoURL, firstName, lastName, companyName, idNumber, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING userId",
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
      data.idNumber,
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
  try {
    const existingUser = db
      .prepare(
        "UPDATE users SET photoURL=?, firstName=?, lastName=?, companyName=?, idNumber=?, phoneNumber=?, password=? WHERE userId=? RETURNING userId",
      )
      .get(
        data.photoURL,
        data.firstName,
        data.lastName,
        data.companyName,
        data.idNumber,
        data.phoneNumber,
        data.password,
        id,
      );

    if (!existingUser) {
      throw new HttpError("User does not exist.", 404);
    }

    return new HttpResponse(
      "User has been succesfully edited.",
      existingUser?.userId,
    );
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError("Internal Server Error", 500);
  }
}

export function loginUser(db: DatabaseSync, data: LoginRequest) {
  try {
    const loginUser = db
      .prepare(
        "SELECT userId, type, photoURL, firstName, lastName, companyName, idNumber, phoneNumber, email FROM users WHERE email = ? AND password = ?",
      )
      .get(data.email, data.password);

    if (!loginUser) {
      throw new HttpError("Email or password is wrong!", 400);
    }

    const token = jwt.sign(
      { type: loginUser.type, id: loginUser.userId },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      },
    );

    return new LoginResponse("User has succesfully logged in.", {
      token: token,
      user: {
        id: loginUser.userId,
        type: loginUser.type,
        photoURL: loginUser.photoURL,
        firstName: loginUser.firstName,
        lastName: loginUser.lastName,
        companyName: loginUser.companyName,
        idNumber: loginUser.idNumber,
        phoneNumber: loginUser.phoneNumber,
        email: loginUser.email,
      },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }

    throw new HttpError("Internal Server Error", 500);
  }
}

export function getUserData(db: DatabaseSync, id: number) {
  try {
    const userData = db
      .prepare(
        "SELECT photoURL, firstName, lastName, companyName, idNumber, phoneNumber, email FROM users WHERE userId = ?",
      )
      .get(id) as any;

    if (!userData) {
      throw new HttpError("The user doesn't exist.", 404);
    }

    const driverArrayData = db
      .prepare(
        "SELECT id, photoUrl, firstName, lastName, phoneNumber FROM companyDriver WHERE companyId = ?",
      )
      .all(id) as unknown as CompanyDriver[];

    const returnData: OverviewUserData = {
      photoURL: userData.photoURL as string,
      firstName: userData.firstName as string,
      lastName: userData.lastName as string,
      companyName: userData.companyName as string,
      idNumber: userData.idNumber as string,
      phoneNumber: userData.phoneNumber as string,
      email: userData.email as string,
      drivers: driverArrayData,
    };

    return returnData;
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError("Internal Server Error", 500);
  }
}

import { DatabaseSync, StatementSync } from "node:sqlite";
import { HttpError, HttpResponse, LoginResponse } from "../config/database";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../env";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BaseUserData {
  photoURL: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  companyId: string;
  phoneNumber: string;
  email: string;
}

export interface OverviewUserData extends BaseUserData {
  drivers: CompanyDriver[] | null;
}

export interface CompanyDriver {
  photoUrl: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UserData extends BaseUserData {
  password: string;
}

export interface User extends UserData {
  type: "company" | "driver";
}

export interface Route {
  fromCity: string;
  toCity: string;
  fromCoordinate: string;
  toCoordinate: string;
  passengerCount: string;
  car: string;
  userId: number;
  companyDriverId: number | null;
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
      data.companyId,
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
      data.companyId,
      data.phoneNumber,
      data.password,
      id,
    );

  return new HttpResponse(
    "User has been succesfully edited.",
    existingUser?.userId,
  );
}

export function loginUser(db: DatabaseSync, data: LoginRequest) {
  try {
    const loginUser = db
      .prepare(
        "SELECT userId, type, photoURL, firstName, lastName, companyName, companyID, phoneNumber, email FROM users WHERE email = ? AND password = ?",
      )
      .get(data.email, data.password);

    if (!loginUser) {
      throw new HttpError("Email or password is wrong!", 400);
    }

    const token = jwt.sign(
      { type: loginUser.type, id: loginUser.id },
      JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      },
    );

    return new LoginResponse("User has succesfully logged in.", token, {
      id: loginUser.userId,
      type: loginUser.type,
      photoURL: loginUser.photoURL,
      firstName: loginUser.firstName,
      lastName: loginUser.lastName,
      companyName: loginUser.companyName,
      companyID: loginUser.companyID,
      phoneNumber: loginUser.phoneNumber,
      email: loginUser.email,
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
        "SELECT photoURL, firstName, lastName, companyName, companyId, phoneNumber, email FROM users WHERE userId = ?",
      )
      .get(id) as any;

    if (!userData) {
      throw new HttpError("The user doesn't exist.", 404);
    }

    const driverArrayData = db
      .prepare(
        "SELECT photoUrl, firstName, lastName, phoneNumber FROM companyDriver WHERE companyId = ?",
      )
      .all(id) as unknown as CompanyDriver[];

    const returnData: OverviewUserData = {
      photoURL: userData.photoURL as string,
      firstName: userData.firstName as string,
      lastName: userData.lastName as string,
      companyName: userData.companyName as string,
      companyId: userData.companyId as string,
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

export function getRouteData(db: DatabaseSync, id: number) {
  try {
    const routeData = db
      .prepare(
        "SELECT fromCity, toCity, fromCoordinate, toCoordinate, passengerCount, car, price, userId, companyDriverid FROM route WHERE routeId = ?",
      )
      .get(id) as Route | undefined;

    if (!routeData) {
      throw new HttpError("The route doesn't exist.", 404);
    }

    return routeData;
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError("Internal Server Error", 500);
  }
}

export function deleteRoute(db: DatabaseSync, id: number) {
  try {
    const deleteRoute = db
      .prepare("DELETE FROM route WHERE routeId = ?")
      .run(id);
  } catch (e) {
    throw new HttpError("Internal Server Error", 500);
  }
}

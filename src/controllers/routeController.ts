import { DatabaseSync, StatementSync } from "node:sqlite";

import { HttpError, HttpResponse } from "../config/database";
import {
  Route,
  RouteFullData,
  RouteFullDataDriverPreview,
  RouteWithId,
} from "../types/route";
import { PreviewUser } from "../types/user";
import { CompanyDriverPreview } from "../types/driver";

export function getAllRoutes(db: DatabaseSync) {
  // This is NOT optimized and honestly can be odne better, but I am sick.
  // For this project, sadly it will do.
  try {
    const routeArray = db
      .prepare("SELECT * FROM routes")
      .all() as unknown as RouteFullDataDriverPreview[];
    if (!routeArray) return [];

    const routeData: RouteFullDataDriverPreview[] = [];
    for (let route of routeArray) {
      const userData = db
        .prepare(
          "SELECT photoURL, phoneNumber, firstName, lastName, companyName FROM users WHERE userId=?",
        )
        .get(route.userId) as PreviewUser | undefined;
      if (!userData) continue;

      const companyDriverData = db
        .prepare(
          "SELECT photoURL, firstName, lastName FROM companyDriver WHERE id=?",
        )
        .get(route.companyDriverId) as CompanyDriverPreview | undefined;

      routeData.push({
        ...route,
        uploadedBy: userData,
        companyDriver: companyDriverData ? companyDriverData : null,
      });
    }

    return routeData;
  } catch (e) {
    throw new HttpError("Internal Server Error", 500);
  }
}

export function getRouteData(db: DatabaseSync, id: number) {
  try {
    const routeData = db
      .prepare("SELECT * FROM routes WHERE routeId = ?")
      .get(id) as RouteFullData | undefined;

    if (!routeData) {
      throw new HttpError("The route doesn't exist.", 404);
    }

    const userData = db
      .prepare(
        "SELECT photoURL, phoneNumber, firstName, lastName, companyName FROM users WHERE userId=?",
      )
      .get(routeData.userId) as PreviewUser | undefined;

    const companyDriverData = db
      .prepare(
        "SELECT photoURL, firstName, lastName FROM companyDriver WHERE id=?",
      )
      .get(routeData.companyDriverId) as CompanyDriverPreview | undefined;

    const returnData = {
      ...routeData,
      uploadedBy: userData,
      companyDriver: companyDriverData ? companyDriverData : null,
    } as unknown as RouteFullData;
    return returnData;
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError("Internal Server Error", 500);
  }
}

export function addRoute(db: DatabaseSync, data: Route) {
  const insert: StatementSync = db.prepare(
    "INSERT INTO routes (fromCity, toCity, fromCoordinate, toCoordinate, passengerCount, departureTime, departureDate, car, price, additionalInfo, userId, companyDriverId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING routeId",
  );

  db.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    const result = insert.get(
      data.fromCity,
      data.toCity,
      data.fromCoordinate,
      data.toCoordinate,
      data.passengerCount,
      data.departureTime,
      data.departureDate ?? "15/10/2026",
      data.car,
      data.price,
      data.additionalInfo ?? null,
      data.userId,
      data.companyDriverId,
    ) as { routeId: number } | undefined;

    db.exec("COMMIT;");

    return new HttpResponse(
      "Route has been succesfully added.",
      result?.routeId,
    );
  } catch (error) {
    db.exec("ROLLBACK;");
    console.error(error);
    throw new HttpError("Internal Server Error", 500);
  }
}

export function editRoute(db: DatabaseSync, data: Route, id: number) {
  try {
    const editedRoute = db
      .prepare(
        "UPDATE routes SET fromCity=?, toCity=?, fromCoordinate=?, toCoordinate=?, passengerCount=?, departureTime=?, departureDate=?, car=?, price=?, additionalInfo=?, companyDriverId=? WHERE routeId = ? RETURNING routeId",
      )
      .get(
        data.fromCity,
        data.toCity,
        data.fromCoordinate,
        data.toCoordinate,
        data.passengerCount,
        data.departureTime,
        data.departureDate ?? "15/10/2026",
        data.car,
        data.price,
        data.additionalInfo ?? null,
        data.companyDriverId,
        id,
      ) as RouteWithId | undefined;

    if (!editedRoute) {
      throw new HttpError("Route does not exist.", 404);
    }

    return new HttpResponse(
      "Route has been succesfully edited.",
      editedRoute?.routeId,
    );
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }

    throw new HttpError("Internal Server Error", 500);
  }
}

export function deleteRoute(db: DatabaseSync, id: number) {
  try {
    db.prepare("DELETE FROM routes WHERE routeId = ?").run(id);
  } catch (e) {
    throw new HttpError("Internal Server Error", 500);
  }
}

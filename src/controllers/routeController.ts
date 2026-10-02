import { DatabaseSync, StatementSync } from "node:sqlite";

import { HttpError, HttpResponse } from "../config/database";
import { Route, RouteWithId } from "../types/route";

export function getRouteData(db: DatabaseSync, id: number) {
  try {
    const routeData = db
      .prepare(
        "SELECT fromCity, toCity, fromCoordinate, toCoordinate, passengerCount, car, price, userId, companyDriverId FROM routes WHERE routeId = ?",
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

export function addRoute(db: DatabaseSync, data: Route) {
  const insert: StatementSync = db.prepare(
    "INSERT INTO routes (fromCity, toCity, fromCoordinate, toCoordinate, passengerCount, car, price, userId, companyDriverId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING routeId",
  );

  db.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    const result = insert.get(
      data.fromCity,
      data.toCity,
      data.fromCoordinate,
      data.toCoordinate,
      data.passengerCount,
      data.car,
      data.price,
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
        "UPDATE routes SET fromCity=?, toCity=?, fromCoordinate=?, toCoordinate=?, passengerCount=?, car=?, price=?, companyDriverId=? WHERE routeId = ? RETURNING routeId",
      )
      .get(
        data.fromCity,
        data.toCity,
        data.fromCoordinate,
        data.toCoordinate,
        data.passengerCount,
        data.car,
        data.price,
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

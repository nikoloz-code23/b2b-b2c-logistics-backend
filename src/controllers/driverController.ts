import { DatabaseSync, StatementSync } from "node:sqlite";

import { CompanyDriverData, CompanyDriverEssential } from "../types/driver";
import { HttpResponse, HttpError } from "../config/database";

export function getCompanyDriver(db: DatabaseSync, id: number) {
  try {
    const data = db
      .prepare(
        "SELECT photoURL, firstName, lastName, phoneNumber FROM companyDriver WHERE id=?",
      )
      .get(id) as CompanyDriverEssential | undefined;

    return data;
  } catch (e) {
    throw new HttpError("Internal Server Error", 500);
  }
}

export function addCompanyDriver(db: DatabaseSync, data: CompanyDriverData) {
  const insert: StatementSync = db.prepare(
    "INSERT INTO companyDriver (photoURL, firstName, lastName, phoneNumber, companyId) VALUES (?, ?, ?, ?, ?) RETURNING id",
  );

  db.exec("BEGIN IMMEDIATE TRANSACTION;");

  try {
    const result = insert.get(
      data.photoURL,
      data.firstName,
      data.lastName,
      data.phoneNumber,
      data.companyId,
    ) as { id: number } | undefined;

    db.exec("COMMIT;");

    return new HttpResponse(
      "Company Driver has been succesfully added.",
      result?.id,
    );
  } catch (error) {
    db.exec("ROLLBACK;");
    console.error(error);
    throw new HttpError("Internal Server Error", 500);
  }
}

export function editCompanyDriver(
  db: DatabaseSync,
  data: CompanyDriverEssential,
  id: number,
) {
  try {
    const existingUser = db
      .prepare(
        "UPDATE companyDriver SET photoURL=?, firstName=?, lastName=?, phoneNumber=? WHERE id=? RETURNING id",
      )
      .get(data.photoURL, data.firstName, data.lastName, data.phoneNumber, id);

    if (!existingUser) {
      throw new HttpError("Company driver does not exist.", 404);
    }

    return new HttpResponse(
      "Company driver has been succesfully edited.",
      existingUser?.id,
    );
  } catch (e) {
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError("Internal Server Error", 500);
  }
}

export function deleteCompanyDriver(db: DatabaseSync, id: number) {
  try {
    db.prepare("DELETE FROM companyDriver WHERE id = ?").run(id);
  } catch (e) {
    throw new HttpError("Internal Server Error", 500);
  }
}

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mockRoutes } from './mockRoutes.ts';
import { mockUsers, mockCompanyDrivers } from './mockUsers.ts';

// Run with: npx tsx seedMockData.ts
// Clears users, companyDriver and routes, then inserts the mock data.
// Stop the server first — it keeps db.sqlite locked.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.resolve(__dirname, 'db.sqlite'));

db.exec('BEGIN');
try {
  db.exec('DELETE FROM routes');
  db.exec('DELETE FROM companyDriver');
  db.exec('DELETE FROM users');

  const insertUser = db.prepare(
    'INSERT INTO users (userId, type, photoURL, firstName, lastName, companyName, idNumber, phoneNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const u of mockUsers) {
    insertUser.run(
      u.id,
      u.type,
      u.photoURL,
      u.firstName,
      u.lastName,
      u.companyName,
      u.idNumber,
      u.phoneNumber,
      u.email,
      u.password
    );
  }

  const insertDriver = db.prepare(
    'INSERT INTO companyDriver (id, photoURL, firstName, lastName, phoneNumber, companyId) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const d of mockCompanyDrivers) {
    insertDriver.run(d.id, d.photoURL, d.firstName, d.lastName, d.phoneNumber, d.companyId);
  }

  const insertRoute = db.prepare(
    'INSERT INTO routes (fromCity, toCity, fromCoordinate, toCoordinate, passengerCount, availableSeats, departureTime, departureDate, car, price, additionalInfo, userId, companyDriverId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const r of mockRoutes) {
    insertRoute.run(
      r.fromCity,
      r.toCity,
      r.fromCoordinate,
      r.toCoordinate,
      r.passengerCount,
      r.availableSeats,
      r.departureTime,
      r.departureDate,
      r.car,
      r.price,
      r.additionalInfo,
      r.userId,
      r.companyDriverId
    );
  }

  db.exec('COMMIT');
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}

const count = (table: string) =>
  (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
console.log(
  `Seeded: ${count('users')} users, ${count('companyDriver')} company drivers, ${count('routes')} routes.`
);
db.close();

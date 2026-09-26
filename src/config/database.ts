import { DatabaseSync } from "node:sqlite"

const DBSOURCE = '../../db.sqlite'
const db = new DatabaseSync(DBSOURCE);

export default db;
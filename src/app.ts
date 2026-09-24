import express, { type Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import db from "./config/database";

const app : Express = express();
const port : number = 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.use((_: Request, res: Response, next: NextFunction) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type'
  });
  next();
})

app.get("/", (req: Request, res: Response) => {
  let sql = "SELECT * FROM users;";

  db.all(sql, [], (err: Error, rows: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows)
  })
})

app.listen(port, () => {
  console.log(`The server is started on http://localhost:${port}`)
})
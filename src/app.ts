import express, {
  type Express,
  NextFunction,
  Request,
  Response,
} from "express";
import cors from "cors";
import db, { HttpError, HttpResponse } from "./config/database";
import { type StatementSync } from "node:sqlite";
import {
  addRoute,
  deleteRoute,
  editRoute,
  getRouteData,
  getUserData,
  loginUser,
  newUser,
  Route,
  updateUser,
} from "./controllers/dbController";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env";

const app: Express = express();
const port: number = 3000;

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use((_: Request, res: Response, next: NextFunction) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  });
  next();
});

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers["authorization"];
  const token: string | undefined = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json(new HttpResponse("Access denied. No token provided."));
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }, (err) => {
    if (err) {
      return res
        .status(403)
        .json(new HttpResponse("Invalid or experied token."));
    }

    next();
  });
};

app.get("/", (_: Request, res: Response) => {
  let sql = "SELECT * FROM users;";
  try {
    const query: StatementSync = db.prepare(sql);
    return res.json(query.all());
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({ error: e.message });
    }
  }
});

app.post("/register", (req: Request, res: Response) => {
  try {
    const result: HttpResponse = newUser(db, req.body);
    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.post("/login", (req: Request, res: Response) => {
  try {
    const result: HttpResponse = loginUser(db, req.body);
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.get("/auth", authenticateToken, (_: Request, res: Response) => {
  return res.status(200);
});

app.get("/overview/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = getUserData(db, Number(userId));
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.post("/logout", (_: Request, res: Response) => {
  res.status(200).json(new HttpResponse("Logged out succesfully."));
});

app.put("/edit/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result: HttpResponse = updateUser(db, req.body, Number(id));
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.get("/route/:routeId", (req: Request, res: Response) => {
  const { routeId } = req.params;

  try {
    const result: Route = getRouteData(db, Number(routeId));
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.post("/route", (req: Request, res: Response) => {
  try {
    const result: HttpResponse = addRoute(db, req.body);
    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.put("/route/:routeId", authenticateToken, (req: Request, res: Response) => {
  const { routeId } = req.params;

  try {
    const result: HttpResponse = editRoute(db, req.body, Number(routeId));
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.delete(
  "/route/:routeId",
  authenticateToken,
  (req: Request, res: Response) => {
    const { routeId } = req.params;

    try {
      deleteRoute(db, Number(routeId));
      return res
        .status(200)
        .json(new HttpResponse("The route has been succesfully deleted."));
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.statusCode).json(e.message);
      }
    }
  },
);

app.listen(port, () => {
  console.log(`The server is started on http://localhost:${port}`);
});

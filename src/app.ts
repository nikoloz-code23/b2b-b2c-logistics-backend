import express, {
  type Express,
  NextFunction,
  Request,
  Response,
} from "express";

import {
  addCompanyDriver,
  editCompanyDriver,
  deleteCompanyDriver,
} from "./controllers/driverController";
import {
  getRouteData,
  addRoute,
  editRoute,
  deleteRoute,
  getAllRoutes,
} from "./controllers/routeController";
import {
  newUser,
  updateUser,
  loginUser,
  getUserData,
} from "./controllers/userController";
import { Route } from "./types/route";

import cors from "cors";
import db, { HttpError, HttpResponse } from "./config/database";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app: Express = express();
const port: number = 3000;

const corsOptions = {
  origin: "http://localhost:5173/",
  credentials: true,
  // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // preflightContinue: false,
  // optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
/*
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
*/

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

/**
 * @openapi
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       400:
 *         description: A user with this email already exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email or password is incorrect.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @openapi
 * /auth:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Validate the current authentication token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authentication token is valid.
 *       401:
 *         description: Missing or invalid authentication token.
 */
app.get("/auth", authenticateToken, (_: Request, res: Response) => {
  return res.sendStatus(200);
});

/**
 * @openapi
 * /overview/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user overview data
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: User overview data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OverviewUserData'
 *       404:
 *         description: The user does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @openapi
 * /logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponseMessage'
 *       401:
 *         description: Missing or invalid authentication token.
 */
app.post("/logout", authenticateToken, (_: Request, res: Response) => {
  res.status(200).json(new HttpResponse("Logged out succesfully."));
});

/**
 * @openapi
 * /edit/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       404:
 *         description: User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @openapi
 * /route:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Get all routes
 *     responses:
 *       200:
 *         description: A list of routes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RouteFullDataDriverPreview'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     tags:
 *       - Routes
 *     summary: Add a new route
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteRequest'
 *     responses:
 *       201:
 *         description: Route successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get("/route", (_: Request, res: Response) => {
  try {
    const result: Route[] | undefined = getAllRoutes(db);
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

/**
 * @openapi
 * /route/{routeId}:
 *   get:
 *     tags:
 *       - Routes
 *     summary: Get route data by ID
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: ID of the route.
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: Route data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RouteFullData'
 *       404:
 *         description: The route does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     tags:
 *       - Routes
 *     summary: Edit a route
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: ID of the route to edit.
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteRequest'
 *     responses:
 *       200:
 *         description: Route successfully edited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       404:
 *         description: Route does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Routes
 *     summary: Delete a route
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: ID of the route to delete.
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: Route successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

app.post("/route", authenticateToken, (req: Request, res: Response) => {
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

/**
 * @openapi
 * /driver:
 *   post:
 *     tags:
 *       - Company Drivers
 *     summary: Add a company driver
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyDriverData'
 *     responses:
 *       201:
 *         description: Company driver successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post("/driver", authenticateToken, (req: Request, res: Response) => {
  try {
    const result: HttpResponse = addCompanyDriver(db, req.body);
    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

/**
 * @openapi
 * /driver/{id}:
 *   put:
 *     tags:
 *       - Company Drivers
 *     summary: Edit a company driver
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the company driver.
 *         schema:
 *           type: integer
 *           format: int64
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyDriverUpdateRequest'
 *     responses:
 *       200:
 *         description: Company driver successfully edited.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       404:
 *         description: Company driver does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     tags:
 *       - Company Drivers
 *     summary: Delete a company driver
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the company driver.
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       200:
 *         description: Company driver successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.put("/driver/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result: HttpResponse = editCompanyDriver(db, req.body, Number(id));
    return res.status(200).json(result);
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.delete("/driver/:id", authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    deleteCompanyDriver(db, Number(id));
    return res
      .status(200)
      .json(new HttpResponse("The driver has been succesfully deleted."));
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json(e.message);
    }
  }
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const server = app.listen(port, () => {
  console.log(`The server is started on http://localhost:${port}`);
  console.log(`Swagger docs are available at http://localhost:${port}/docs`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

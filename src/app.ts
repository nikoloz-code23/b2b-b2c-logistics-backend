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
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors());
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
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       400:
 *         description: A user with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
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
 *     summary: Log in a user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     summary: Verify the current JWT
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 */
app.get("/auth", authenticateToken, (_: Request, res: Response) => {
  return res.sendStatus(200);
});

/**
 * @openapi
 * /overview/{userId}:
 *   get:
 *     summary: Get user overview data
 *     tags:
 *       - User Data
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 photoURL:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                   nullable: true
 *                 lastName:
 *                   type: string
 *                   nullable: true
 *                 companyName:
 *                   type: string
 *                   nullable: true
 *                 companyId:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 email:
 *                   type: string
 *                 drivers:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                     properties:
 *                       photoUrl:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *       404:
 *         description: User does not exist
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
 *     summary: Log out the current user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 */
app.post("/logout", authenticateToken, (_: Request, res: Response) => {
  res.status(200).json(new HttpResponse("Logged out succesfully."));
});

/**
 * @openapi
 * /edit/{id}:
 *   put:
 *     summary: Edit a user
 *     tags:
 *       - User Data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User successfully edited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       404:
 *         description: User does not exist
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
 *     summary: Get route data
 *     tags:
 *       - Routes
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: Route ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Route data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Route'
 *       404:
 *         description: Route does not exist
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

/**
 * @openapi
 * /route:
 *   post:
 *     summary: Add a route
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       201:
 *         description: Route successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 */
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

/**
 * @openapi
 * /route/{routeId}:
 *   put:
 *     summary: Edit a route
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: Route ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Route'
 *     responses:
 *       200:
 *         description: Route successfully edited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       404:
 *         description: Route does not exist
 */
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

/**
 * @openapi
 * /route/{routeId}:
 *   delete:
 *     summary: Delete a route
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: routeId
 *         in: path
 *         required: true
 *         description: Route ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Route successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       404:
 *         description: Route does not exist
 */
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
 *     summary: Add a company driver
 *     tags:
 *       - Drivers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photoUrl
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - companyId
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 example: "https://example.com/driver.jpg"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Driver"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               companyId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Driver successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       500:
 *         description: Internal server error
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
 *     summary: Edit a company driver
 *     tags:
 *       - Drivers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Driver ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - photoUrl
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - companyId
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 example: "https://example.com/driver.jpg"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Driver"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               companyId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Driver successfully edited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       404:
 *         description: Driver does not exist
 *       500:
 *         description: Internal server error
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

/**
 * @openapi
 * /driver/{id}:
 *   delete:
 *     summary: Delete a company driver
 *     tags:
 *       - Drivers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Driver ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Driver successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpResponse'
 *       401:
 *         description: No token was provided
 *       403:
 *         description: Token is invalid or expired
 *       404:
 *         description: Driver does not exist
 *       500:
 *         description: Internal server error
 */
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

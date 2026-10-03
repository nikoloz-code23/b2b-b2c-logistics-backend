import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: "3.0.3",

  info: {
    title: "Route Management API",
    version: "1.0.0",
    description: "API for user authentication and route management.",
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Authentication",
      description: "User registration, login, logout, and authentication",
    },
    {
      name: "Users",
      description: "User overview and editing user data",
    },
    {
      name: "Routes",
      description: "Route management endpoints",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      ErrorResponse: {
        type: "string",
        description: "Error messages are returned directly as JSON strings.",
        example: "The route doesn't exist.",
      },

      HttpResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "Route has been succesfully added.",
          },
          id: {
            type: "integer",
            format: "int64",
            description:
              "Returned when the created or updated resource has an ID.",
            example: 15,
          },
        },
      },

      HttpResponseMessage: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "Route has been succesfully logged out.",
          },
        },
      },

      LoginResponse: {
        type: "object",
        required: ["message", "token", "user"],
        properties: {
          message: {
            type: "string",
            example: "User has succesfully logged in.",
          },
          token: {
            type: "string",
            description: "JWT authentication token.",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-token",
          },
          user: {
            $ref: "#/components/schemas/LoginUser",
          },
        },
      },

      LoginUser: {
        type: "object",
        required: [
          "id",
          "type",
          "photoURL",
          "idNumber",
          "phoneNumber",
          "email",
        ],
        properties: {
          id: {
            type: "integer",
            format: "int64",
            example: 1,
          },
          type: {
            type: "string",
            enum: ["company", "driver"],
            example: "company",
          },
          photoURL: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Example Transport Ltd",
          },
          idNumber: {
            type: "string",
            example: "COMP-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "company@example.com",
          },
        },
      },

      PreviewUser: {
        type: "object",
        required: ["photoURL"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
        },
      },

      BaseUserData: {
        type: "object",
        required: ["photoURL", "idNumber", "phoneNumber", "email"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
          idNumber: {
            type: "string",
            example: "DRV-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
        },
      },

      RegisterRequest: {
        type: "object",
        required: [
          "type",
          "photoURL",
          "idNumber",
          "phoneNumber",
          "email",
          "password",
        ],
        properties: {
          type: {
            type: "string",
            enum: ["company", "driver"],
            example: "driver",
          },
          photoURL: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
          idNumber: {
            type: "string",
            example: "DRV-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "strong-password",
          },
        },
      },

      UpdateUserRequest: {
        type: "object",
        required: ["photoURL", "idNumber", "phoneNumber", "email", "password"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/new-profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
          idNumber: {
            type: "string",
            example: "DRV-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "john.updated@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "new-password",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "strong-password",
          },
        },
      },

      CompanyDriverPreview: {
        type: "object",
        required: ["photoURL", "firstName", "lastName"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/driver.jpg",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
        },
      },

      CompanyDriverEssential: {
        type: "object",
        required: ["photoURL", "firstName", "lastName", "phoneNumber"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/driver.jpg",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
        },
      },

      CompanyDriver: {
        type: "object",
        required: ["id", "photoURL", "firstName", "lastName", "phoneNumber"],
        properties: {
          id: {
            type: "integer",
            format: "int64",
            example: 15,
          },
          photoURL: {
            type: "string",
            example: "https://example.com/driver.jpg",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
        },
      },

      CompanyDriverData: {
        type: "object",
        required: [
          "photoURL",
          "firstName",
          "lastName",
          "phoneNumber",
          "companyId",
        ],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/driver.jpg",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          companyId: {
            type: "integer",
            format: "int64",
            example: 1,
          },
        },
      },

      CompanyDriverUpdateRequest: {
        type: "object",
        required: ["photoURL", "firstName", "lastName", "phoneNumber"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/updated-driver.jpg",
          },
          firstName: {
            type: "string",
            example: "John",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
        },
      },

      OverviewUserData: {
        type: "object",
        required: ["photoURL", "idNumber", "phoneNumber", "email", "drivers"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/company.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
          lastName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: null,
          },
          companyName: {
            type: "string",
            nullable: true,
            description: "Can contain a string or null.",
            example: "Example Transport Ltd",
          },
          idNumber: {
            type: "string",
            example: "COMP-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          email: {
            type: "string",
            format: "email",
            example: "company@example.com",
          },
          drivers: {
            type: "array",
            nullable: true,
            description: "Can contain an array of drivers or null.",
            example: [
              {
                id: 15,
                photoURL: "https://example.com/driver.jpg",
                firstName: "John",
                lastName: "Doe",
                phoneNumber: "+1234567890",
              },
            ],
            items: {
              $ref: "#/components/schemas/CompanyDriver",
            },
          },
        },
      },

      Route: {
        type: "object",
        required: [
          "fromCity",
          "toCity",
          "fromCoordinate",
          "toCoordinate",
          "passengerCount",
          "car",
          "price",
          "userId",
          "companyDriverId",
        ],
        properties: {
          fromCity: {
            type: "string",
            example: "New York",
          },
          toCity: {
            type: "string",
            example: "Boston",
          },
          fromCoordinate: {
            type: "string",
            example: "40.7128,-74.0060",
          },
          toCoordinate: {
            type: "string",
            example: "42.3601,-71.0589",
          },
          passengerCount: {
            type: "string",
            example: "3",
          },
          car: {
            type: "string",
            example: "Toyota Prius",
          },
          price: {
            type: "number",
            format: "double",
            example: 150.5,
          },
          userId: {
            type: "integer",
            format: "int64",
            example: 1,
          },
          companyDriverId: {
            type: "integer",
            format: "int64",
            nullable: true,
            description: "Can contain a driver ID or null.",
            example: null,
          },
        },
      },

      RouteRequest: {
        type: "object",
        required: [
          "fromCity",
          "toCity",
          "fromCoordinate",
          "toCoordinate",
          "passengerCount",
          "car",
          "price",
          "userId",
          "companyDriverId",
        ],
        properties: {
          fromCity: {
            type: "string",
            example: "New York",
          },
          toCity: {
            type: "string",
            example: "Boston",
          },
          fromCoordinate: {
            type: "string",
            example: "40.7128,-74.0060",
          },
          toCoordinate: {
            type: "string",
            example: "42.3601,-71.0589",
          },
          passengerCount: {
            type: "string",
            example: "3",
          },
          car: {
            type: "string",
            example: "Toyota Prius",
          },
          price: {
            type: "number",
            format: "double",
            example: 150.5,
          },
          userId: {
            type: "integer",
            format: "int64",
            example: 1,
          },
          companyDriverId: {
            type: "integer",
            format: "int64",
            nullable: true,
            description: "Can contain a driver ID or null.",
            example: null,
          },
        },
      },

      RouteWithId: {
        allOf: [
          {
            $ref: "#/components/schemas/Route",
          },
          {
            type: "object",
            required: ["routeId"],
            properties: {
              routeId: {
                type: "integer",
                format: "int64",
                example: 15,
              },
            },
          },
        ],
      },

      RouteFullDataDriverPreview: {
        allOf: [
          {
            $ref: "#/components/schemas/RouteWithId",
          },
          {
            type: "object",
            required: ["uploadedBy", "companyDriver"],
            properties: {
              uploadedBy: {
                $ref: "#/components/schemas/PreviewUser",
              },
              companyDriver: {
                allOf: [
                  {
                    $ref: "#/components/schemas/CompanyDriverPreview",
                  },
                ],
                nullable: true,
                description:
                  "Can contain a company driver preview object or null.",
                example: null,
              },
            },
          },
        ],
      },

      RouteFullData: {
        allOf: [
          {
            $ref: "#/components/schemas/RouteWithId",
          },
          {
            type: "object",
            required: ["uploadedBy", "companyDriver"],
            properties: {
              uploadedBy: {
                $ref: "#/components/schemas/PreviewUser",
              },
              companyDriver: {
                allOf: [
                  {
                    $ref: "#/components/schemas/CompanyDriverEssential",
                  },
                ],
                nullable: true,
                description:
                  "Can contain essential company driver data or null.",
                example: null,
              },
            },
          },
        ],
      },
    },
  },
};

const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: ["./src/app.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;

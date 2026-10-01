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
      description: "User profile and overview endpoints",
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
      User: {
        type: "object",
        required: [
          "type",
          "photoURL",
          "companyId",
          "phoneNumber",
          "email",
          "password",
        ],
        properties: {
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
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            example: "Example Transport Ltd",
          },
          companyId: {
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
            example: "john@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "strong-password",
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

      UserUpdate: {
        type: "object",
        required: ["photoURL", "companyId", "phoneNumber", "password"],
        properties: {
          photoURL: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
          firstName: {
            type: "string",
            nullable: true,
            example: "John",
          },
          lastName: {
            type: "string",
            nullable: true,
            example: "Doe",
          },
          companyName: {
            type: "string",
            nullable: true,
            example: "Example Transport Ltd",
          },
          companyId: {
            type: "string",
            example: "COMP-001",
          },
          phoneNumber: {
            type: "string",
            example: "+1234567890",
          },
          password: {
            type: "string",
            format: "password",
            example: "new-password",
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
            format: "float",
            example: 150.5,
          },
          userId: {
            type: "integer",
            example: 1,
          },
          companyDriverid: {
            type: "integer",
            nullable: true,
            example: 2,
          },
        },
      },

      HttpResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Operation completed successfully.",
          },
          id: {
            nullable: true,
            example: 1,
          },
        },
      },

      LoginResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "User has successfully logged in.",
          },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          user: {
            type: "object",
            properties: {
              id: {
                type: "integer",
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
                example: "John",
              },
              lastName: {
                type: "string",
                nullable: true,
                example: "Doe",
              },
              companyName: {
                type: "string",
                nullable: true,
                example: "Example Transport Ltd",
              },
              companyID: {
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
                example: "john@example.com",
              },
            },
          },
        },
      },

      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "User does not exist.",
          },
        },
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

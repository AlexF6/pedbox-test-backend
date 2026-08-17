import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "PedBox API",
      version: "1.0.0",
      description:
        "REST API for authentication and Rick and Morty character data.",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Characters",
        description: "Character endpoints",
      },
      {
        name: "Sync",
        description: "Data synchronization endpoints",
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
    },
  },

  apis: [
    "./src/routes/*.ts",
    "./src/docs/schemas/*.ts",
  ],
};

const openapi = swaggerJSDoc(options);

export default openapi;
# Express TypeScript API

This repository contains a RESTful API built with Express, TypeScript, and Prisma ORM. It features JWT authentication, data synchronization services, Zod-based request validation, Jest testing, and integrated OpenAPI/Swagger documentation.

## Tech Stack

- **Runtime & Language:** Node.js, TypeScript (executed via `tsx` in development)
- **Framework:** Express
- **Database & ORM:** PostgreSQL with Prisma
- **Package Manager:** PNPM
- **Validation:** Zod
- **Testing:** Jest with `ts-jest`
- **Documentation:** Swagger UI (`swagger-jsdoc` and `swagger-ui-express`)
- **Authentication:** JSON Web Tokens (JWT) and Bcrypt

---

## Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:
- Node.js (v20+ recommended)
- [PNPM](https://pnpm.io/)
- A PostgreSQL database instance

### Installation

1. Clone the repository and navigate to the project root.
2. Install the dependencies using PNPM:
   ```bash
   pnpm install
   ```

### Configuration

Create a `.env` file in the root directory. You can use the following template to define your environment variables:

```env
# Server configuration
PORT=3000

# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# JWT Configuration
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="1d"
```

### Database Setup

Run the migrations to create the database schemas and generate the Prisma client:

```bash
# Run migrations
pnpm prisma migrate dev

# Generate Prisma Client
pnpm prisma generate
```

---

## Running the Application

### Development Mode

Start the development server with hot-reloading using `tsx`:

```bash
pnpm dev
```
*(Note: Ensure your `package.json` has a `dev` script mapped to `tsx src/index.ts` or similar).*

### Production Build

Build and run the compiled JavaScript:

```bash
# Build the TypeScript project
pnpm build

# Start the compiled application
pnpm start
```

---

## Project Structure

```text
├── prisma/                 # Database schema definitions and migrations
├── src/
│   ├── config/             # Application configuration files
│   ├── controllers/        # Express controllers handling requests/responses
│   ├── docs/               # OpenAPI/Swagger schemas and configuration
│   ├── generated/          # Auto-generated Prisma client types
│   ├── lib/                # Shared library instances (e.g., Prisma client)
│   ├── middlewares/        # Express middlewares (Authentication, Error handling)
│   ├── routes/             # Express API routing definitions
│   ├── services/           # Business logic and database operations
│   ├── utils/              # Helper utilities (e.g., Zod validation)
│   └── index.ts            # Entry point of the application
```

---

## API & Features

### Main Modules

1. **Authentication (`/auth`)**
   - User registration and login functionality.
   - Password hashing with Bcrypt and stateless session handling via JWT.

2. **Synchronization Service (`/sync`)**
   - Coordinates the import or synchronization of external data (such as characters, episodes, and locations) with the local database.

3. **Characters (`/characters`)**
   - Endpoints to retrieve and manage character data along with related episode and location structures.

### Documentation

The API includes interactive Swagger documentation. Once the server is running, you can view the endpoint specifications and test requests directly via your browser:

- **Swagger UI URL:** `http://localhost:3000/api/docs`

---

## Running Tests

Unit and integration tests are written using Jest. To run the test suite, execute:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```
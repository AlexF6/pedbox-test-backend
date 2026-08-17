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
DATABASE_URL=postgresql://username:password@localhost:5432/database_name?schema=public

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
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
# Modelo de Datos — Prisma Schema

Este documento describe la arquitectura de la base de datos de la aplicación, las entidades principales, sus atributos y las relaciones definidas mediante **Prisma ORM**.

La base de datos utiliza **PostgreSQL** y el modelo está diseñado para almacenar usuarios, personajes, ubicaciones y episodios provenientes de una API externa.

---

## Diagrama Entidad-Relación (ER)

```text
+------------------+         +----------------------+         +--------------------+
|     Location     |         |      Character       |         |      Episode       |
+------------------+         +----------------------+         +--------------------+
| id (PK)          |<-------1| id (PK)              |         | id (PK)            |
| externalId       |        *| externalId           |         | externalId         |
| name             |         | name                 |         | name               |
| type             |         | status               |         | airDate            |
| dimension        |         | species              |         | episodeCode        |
| createdAt        |         | type                 |         | createdAt          |
| updatedAt        |         | gender               |         | updatedAt          |
+------------------+         | image                |         | updatedAt          |
                             | locationId (FK)      |         +--------------------+
                             | createdAt            |                  ^
                             | updatedAt            |                  | 1
                             +----------------------+                  |
                                        | 1                            |
                                        |                              |
                                        v *                            | *
                             +-----------------------------------------------+
                             |               CharacterEpisode                |
                             +-----------------------------------------------+
                             | characterId (PK, FK)                          |
                             | episodeId   (PK, FK)                          |
                             +-----------------------------------------------+
```

---

## Entidades

### `User`

Almacena la información necesaria para la autenticación y gestión de las credenciales de los usuarios.

| Campo | Descripción |
|---|---|
| `id` | Identificador único autoincremental. Clave primaria. |
| `email` | Correo electrónico del usuario. Debe ser único. |
| `passwordHash` | Hash de la contraseña del usuario. |
| `createdAt` | Fecha y hora de creación del registro. |
| `updatedAt` | Fecha y hora de la última actualización. |

---

### `Location`

Representa los lugares u orígenes dentro del universo de datos de la aplicación.

| Campo | Descripción |
|---|---|
| `id` | Identificador interno autoincremental. Clave primaria. |
| `externalId` | Identificador proveniente de la API externa. Único. |
| `name` | Nombre de la ubicación. |
| `type` | Tipo de ubicación. Campo opcional. |
| `dimension` | Dimensión a la que pertenece. Campo opcional. |
| `createdAt` | Fecha y hora de creación del registro. |
| `updatedAt` | Fecha y hora de la última actualización. |

---

### `Character`

Almacena la información detallada de los personajes obtenidos desde la API externa.

| Campo | Descripción |
|---|---|
| `id` | Identificador interno autoincremental. Clave primaria. |
| `externalId` | Identificador proveniente de la API externa. Único. |
| `name` | Nombre del personaje. |
| `status` | Estado actual del personaje, por ejemplo `Alive`, `Dead` o `unknown`. |
| `species` | Especie del personaje. |
| `type` | Subtipo o especificación de la especie. Campo opcional. |
| `gender` | Género del personaje. |
| `image` | URL de la imagen del personaje. |
| `locationId` | Referencia a la ubicación asociada. Clave foránea opcional. |
| `createdAt` | Fecha y hora de creación del registro. |
| `updatedAt` | Fecha y hora de la última actualización. |

---

### `Episode`

Almacena la información correspondiente a los episodios.

| Campo | Descripción |
|---|---|
| `id` | Identificador interno autoincremental. Clave primaria. |
| `externalId` | Identificador proveniente de la API externa. Único. |
| `name` | Título del episodio. |
| `airDate` | Fecha original de emisión. |
| `episodeCode` | Código identificador del episodio, por ejemplo `S01E01`. |
| `createdAt` | Fecha y hora de creación del registro. |
| `updatedAt` | Fecha y hora de la última actualización. |

---

### `CharacterEpisode`

Tabla intermedia explícita utilizada para representar la relación muchos a muchos entre `Character` y `Episode`.

| Campo | Descripción |
|---|---|
| `characterId` | Identificador del personaje. Clave foránea y parte de la clave primaria compuesta. |
| `episodeId` | Identificador del episodio. Clave foránea y parte de la clave primaria compuesta. |

La combinación de `characterId` y `episodeId` constituye la clave primaria mediante:

```prisma
@@id([characterId, episodeId])
```

---

## Relaciones

### `Location` → `Character`

**Tipo:** Uno a Muchos (`1:N`)

Una ubicación puede estar asociada con múltiples personajes, mientras que cada personaje puede tener una única ubicación asociada.

La relación se implementa mediante el campo `locationId` de `Character`.

La relación es opcional, por lo que un personaje puede existir sin una ubicación asociada.

```text
Location 1 ─────────── * Character
```

---

### `Character` ↔ `Episode`

**Tipo:** Muchos a Muchos (`M:N`)

Un personaje puede aparecer en múltiples episodios y, a su vez, un episodio puede incluir múltiples personajes.

Esta relación se implementa mediante la tabla intermedia `CharacterEpisode`.

```text
Character 1 ─────────── * CharacterEpisode * ─────────── 1 Episode
```

La tabla utiliza una clave primaria compuesta:

```prisma
@@id([characterId, episodeId])
```

#### Eliminación en cascada

Las relaciones con `CharacterEpisode` utilizan `onDelete: Cascade`.

Esto permite mantener la integridad referencial de la base de datos. Cuando se elimina un personaje o un episodio, las filas correspondientes de `CharacterEpisode` se eliminan automáticamente.

---

## Integridad y restricciones

El modelo utiliza diferentes restricciones para garantizar la consistencia de los datos:

- Las entidades principales utilizan identificadores internos como claves primarias.
- `externalId` es único para evitar duplicados provenientes de la API externa.
- `User.email` es único para impedir múltiples cuentas con el mismo correo.
- `CharacterEpisode` utiliza una clave primaria compuesta para evitar relaciones duplicadas.
- Las claves foráneas mantienen la integridad entre las entidades relacionadas.
- Las relaciones con eliminación en cascada evitan registros huérfanos en `CharacterEpisode`.
- Los campos marcados como opcionales permiten almacenar entidades que no dispongan de determinada información.

---

## Configuración de Prisma

### Base de datos

El proyecto utiliza:

- **ORM:** Prisma
- **Motor de base de datos:** PostgreSQL

### Prisma Client

El cliente generado por Prisma se encuentra en:

```text
../src/generated/prisma
```

La configuración del generador permite que el código generado por Prisma sea utilizado directamente desde la aplicación.

---

## Resumen del modelo

| Entidad | Propósito | Relaciones |
|---|---|---|
| `User` | Autenticación y usuarios | — |
| `Location` | Ubicaciones | `1:N` con `Character` |
| `Character` | Información de personajes | `N:1` con `Location`, `M:N` con `Episode` |
| `Episode` | Información de episodios | `M:N` con `Character` |
| `CharacterEpisode` | Tabla intermedia | Une `Character` y `Episode` |

---

## Arquitectura de relaciones

```text
                         +-------------+
                         |    User     |
                         +-------------+

                         +-------------+
                         |  Location   |
                         +-------------+
                                |
                                | 1:N
                                v
                         +-------------+
                         |  Character  |
                         +-------------+
                                |
                                | M:N
                                v
                      +---------------------+
                      | CharacterEpisode    |
                      +---------------------+
                                ^
                                |
                                | M:N
                         +-------------+
                         |   Episode   |
                         +-------------+
```

Este modelo proporciona una estructura normalizada para almacenar los datos obtenidos desde la API externa y mantener las relaciones entre personajes, ubicaciones y episodios de forma consistente.


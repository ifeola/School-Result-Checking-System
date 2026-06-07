# School Result Checking System

A backend server for a school result checking system built with Node.js, Express, TypeScript, and PostgreSQL. The API supports authentication, student registration, protected admin operations, and role-based access control.

## Features

- JWT-based authentication with support for Bearer token and HTTP-only cookie
- Role-based authorization for admin and student routes
- Student management endpoints (create, list, update, delete)
- Paginated student listing
- Request validation using `express-validator`
- Centralized error handling middleware
- PostgreSQL database integration
- Auto-generated admission numbers and secure password hashing

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- `jsonwebtoken`
- `express-validator`
- `bcrypt`
- `cookie-parser`
- `cors`
- `dotenv`
- `zod`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database available
- `npm` installed

### Installation

```bash
git clone https://github.com/ifeola/School-Result-Checking-System.git
cd School-Result-Checking-System
npm install
```

### Environment Variables

Create a `.env` file at the project root and define the following values:

```env
PORT=3000
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Run in Development

```bash
npm run dev
```

### Build and Run for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` — start the server with `nodemon` for development
- `npm run build` — compile TypeScript to JavaScript in `dist/`
- `npm start` — run the compiled production build

## API Endpoints

All routes are mounted under `/api/v1`.

### Authentication

#### `POST /api/v1/auth/login`

Authenticate a user by email or admission number.

Request body example:

```json
{
	"identifier": "user@example.com",
	"password": "password"
}
```

Response:

- Sets a `jwt` HTTP-only cookie
- Returns login success and authenticated user info

### Student Management

#### `GET /api/v1/students`

Fetch a paginated list of students.

- Requires authentication
- Roles allowed: `admin`, `student`
- Optional query parameters:
  - `page` (default: 1)
  - `limit` (default: 10)

#### `POST /api/v1/students`

Create a new student record.

- Requires authentication
- Admin-only route
- Validates student data before creation

Request body example:

```json
{
	"firstName": "John",
	"lastName": "Doe",
	"middleName": "A",
	"gender": "male",
	"parentName": "Jane Doe",
	"parentPhone": "08012345678",
	"dateOfBirth": "2008-05-18"
}
```

The API will generate:

- `admissionNumber`
- a hashed password (derived from the last name)

#### `PATCH /api/v1/students/:id`

Update an existing student.

- Requires authentication
- Admin-only route
- Supports partial updates of student fields

#### `DELETE /api/v1/students/:id`

Delete a student record.

- Requires authentication
- Admin-only route

## Authentication Details

The backend accepts the JWT from either:

- `Authorization: Bearer <token>` header
- `jwt` HTTP-only cookie

Protected routes use `authenticate` and `authorize` middleware for access control.

## Project Structure

- `src/server.ts` — application entrypoint
- `src/routes` — route definitions
- `src/controllers` — request handlers
- `src/middlewares` — authentication, authorization, validation, and error handling
- `src/services` — business logic and helper functions
- `src/utils` — token creation, pagination utilities, and generators
- `src/database/db.ts` — PostgreSQL connection logic

## Notes

- Verify that `DATABASE_URL` is pointing to a valid Postgres instance.
- Keep `JWT_SECRET` safe and never commit it to source control.
- Use `NODE_ENV=production` in production environments for secure cookie behavior.

# School Result Checking System

A backend server for a school result checking system built with Node.js, Express, TypeScript, and PostgreSQL. The server provides authentication, student administration, and protected route handling for admin and student users.

## Features

- JWT-based authentication with cookie and bearer token support
- Admin-protected student management endpoints
- Student listing with pagination
- Input validation using `express-validator`
- Centralized error handling
- PostgreSQL database support

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

Create a `.env` file at the project root and define the following variables:

```bash
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

## API Endpoints

All routes are mounted under `/api/v1`.

### Authentication

#### `POST /api/v1/auth/login`

Authenticate a user by email or admission number.

Request body:

```json
{
	"identifier": "user@example.com",
	"password": "password"
}
```

Response:

- Sets a `jwt` cookie
- Returns login success and user details

### Student Management

#### `GET /api/v1/students`

Fetch paginated student records.

- Requires authentication
- Roles allowed: `admin`, `student`
- Query parameters: `page`, `limit`

#### `POST /api/v1/students`

Create a new student record.

- Requires authentication
- Admin-only route
- Validates student data before creating

Request body:

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

Generated fields:

- `admissionNumber` is auto-generated
- student password is hashed from the uppercased last name

#### `PATCH /api/v1/students/:id`

Update an existing student.

- Requires authentication
- Admin-only route
- Request body can include any student fields to update

#### `DELETE /api/v1/students/:id`

Delete a student record.

- Requires authentication
- Admin-only route

## Authentication Details

The backend accepts the JWT from either:

- `Authorization: Bearer <token>` header
- `jwt` HTTP-only cookie

Protected routes use `authenticate` and `authorize` middleware to enforce access control.

## Project Structure

- `src/server.ts` — application entrypoint
- `src/routes` — route definitions
- `src/controllers` — request handlers
- `src/middlewares` — auth, authorization, validation, and error handling
- `src/services` — business logic and database helpers
- `src/utils` — token creation, pagination, and helper utilities
- `src/database/db.ts` — PostgreSQL connection

## Notes

- Ensure `DATABASE_URL` is correct and points to your Postgres instance.
- Keep `JWT_SECRET` secure and do not share it publicly.
- In production, use `NODE_ENV=production` to enable secure cookie settings.

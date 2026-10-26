# School Result Checking System

Backend API for a Nigerian secondary school result-checking system. It handles authentication, student and teacher records, result queries, and PDF report-card generation.

## Features

- JWT authentication via HTTP-only cookie or `Authorization: Bearer`
- Role-based access for `super_admin`, `staff_admin`, `teacher`, and `student`
- Student and teacher management
- Result lookup, class position, result counts, and PDF report cards
- Zod request validation and parameterized SQL
- Global, login, and PDF-generation rate limits
- Helmet security headers, strict CORS allowlist, body-size limits
- Centralized production-safe error handling
- Vitest + Supertest security regression suite

## Tech Stack

- Node.js 22.18+ / 24
- TypeScript
- Express 5
- PostgreSQL (`pg`)
- Zod
- JWT (`jsonwebtoken`)
- bcrypt
- Puppeteer (PDF generation)
- pnpm

## Getting Started

### Prerequisites

- Node.js 22.18+ (Node 24 recommended)
- pnpm 11.28+
- PostgreSQL database

### Installation

```bash
git clone https://github.com/ifeola/School-Result-Checking-System.git
cd School-Result-Checking-System
pnpm install
cp .env.example .env
```

Edit `.env` before starting the server.

### Run in Development

```bash
pnpm dev
```

### Build and Run for Production

```bash
pnpm build
pnpm start
```

## Environment Variables

See `.env.example` for the full annotated list. Production requires at minimum:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=<at-least-32-random-characters>
CORS_ORIGINS=https://your-frontend.example
TRUST_PROXY=1
```

Important production settings:

- `CORS_ORIGINS` is a comma-separated exact allowlist. Wildcards are rejected.
- `TRUST_PROXY` must match the number of trusted reverse proxies so rate limits use real client IPs.
- `COOKIE_SECURE=true` is required in production; `COOKIE_SAME_SITE=none` additionally requires HTTPS.
- `RATE_LIMIT_STORE=memory` is the only implemented store. Use one process or add a Redis store for multiple instances.
- `PUPPETEER_NO_SANDBOX=true` only when running Chromium in a container that cannot use its sandbox.
- Set `DB_SSL_REJECT_UNAUTHORIZED=true` after trusting the database provider's CA certificate.

## Available Scripts

- `pnpm dev` — run with nodemon
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled build
- `pnpm typecheck` — TypeScript check without emitting
- `pnpm test` — run the Vitest suite
- `pnpm test:watch` — run tests in watch mode
- `pnpm verify` — typecheck, tests, and build
- `pnpm audit` — dependency vulnerability audit

## API Overview

All business routes are under `/api/v1`. `GET /health` is an unauthenticated liveness probe.

### Authentication

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/logout` | Public (clears cookie) |
| GET | `/api/v1/auth/me` | Authenticated |

Login accepts an email, admission number, staff number, or admin number plus a password. It sets an HTTP-only `jwt` cookie and returns safe user data.

### Students

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/v1/students` | `super_admin`, `staff_admin` |
| GET | `/api/v1/students` | `super_admin`, `staff_admin`, `teacher` |
| GET | `/api/v1/students/:id` | Any authenticated role; students only their own record |
| PATCH | `/api/v1/students/:id` | `super_admin`, `staff_admin` |
| DELETE | `/api/v1/students/:id` | `super_admin`, `staff_admin` |

Create body uses snake_case:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": "A",
  "gender": "male",
  "parent_name": "Jane Doe",
  "parent_phone": "08012345678",
  "date_of_birth": "2008-05-18",
  "class_name": "class-uuid",
  "department_name": "department-uuid-or-null"
}
```

`class_name` and `department_name` are UUIDs. Senior classes require a department; junior classes must not have one.

### Teachers

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/v1/teachers` | `super_admin`, `staff_admin`, `teacher` |
| POST | `/api/v1/teachers` | `super_admin`, `staff_admin` |
| DELETE | `/api/v1/teachers/:id` | `super_admin`, `staff_admin` |

### Results and PDF

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/v1/students/:admission_number/results` | Authenticated; students only their own results |
| GET | `/api/v1/students/:admission_number/position` | Authenticated; students only their own position |
| GET | `/api/v1/students/:admission_number/previous/results` | Authenticated; students only their own results |
| GET | `/api/v1/students/results` | Staff/teacher |
| GET | `/api/v1/students/results/counts` | Staff/teacher |
| GET | `/api/v1/result/:id/pdf` | Authenticated; students only their own PDF |

Result routes accept `term`/`session` or `term_name`/`session_name` query values.

### Reference Data

`GET /api/v1/classes`, `/api/v1/departments`, and `/api/v1/terms` are public. Academic-session routes require authentication.

## Security Notes

- Helmet is enabled; HSTS is production-only.
- `Cache-Control: no-store` is applied to API responses.
- Request bodies are limited to `100kb` by default.
- Login failures return a generic `Invalid username or password.` response.
- JWTs expire after one hour by default; there is currently no refresh/revocation flow.
- PDF generation disables JavaScript and escapes report-card values via EJS.
- Run `pnpm verify` before deploying.

## Deployment Checklist

1. Use HTTPS and set `TRUST_PROXY` correctly.
2. Set exact `CORS_ORIGINS` and a strong `JWT_SECRET`.
3. Install Chromium/headless-shell for Puppeteer in the runtime image.
4. Configure database TLS and backups.
5. Add Redis-backed rate limiting if running more than one API instance.
6. Ship logs to a central service and configure uptime checks against `/health`.
7. Do not commit `.env`, migration logs, or exported student data.

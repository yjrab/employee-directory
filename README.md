# Employee Directory

Modern employee directory built with Node.js, Express, Prisma, PostgreSQL (Supabase), React, Vite, and Tailwind CSS.

## Features

- Authentication with access/refresh tokens
- Role-based access control (ADMIN, EMPLOYEE)
- Employee CRUD (create, read, update, delete)
  - ADMIN: create, edit, delete any employee
  - EMPLOYEE: edit only their own profile
- Directory with search, filters, pagination
  - Search across name, email, phone, job title, department, location
  - Department filter and debounced search input
- Employee cards and profile page
  - Card preview: name, job title, department, email
  - Profile page: details (job title, department, phone, location, hire date)
  - Admin-only edit and delete

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (Supabase is recommended)

## Environment Setup

1. Copy `backend/.env.example` to `backend/.env` and fill in your settings:
   - `DATABASE_URL` (Supabase Postgres connection string)
   - `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` (generate strong secrets)
   - `CORS_ORIGINS` (e.g. `http://localhost:5173`)
2. Copy `frontend/.env.example` to `frontend/.env` and set:
   - `VITE_API_URL` (e.g. `http://localhost:4000`)
3. Run `npm install` in both backend and frontend folders.
4. Apply Prisma schema and seed data (optional):
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   # Optional seed (creates sample employees)
   npm run build # if needed
   npm run seed
   ```
5. Run the servers:
   - Backend: `cd backend && npm run dev` (http://localhost:4000)
   - Frontend: `cd frontend && npm run dev` (http://localhost:5173)

## Trying It Out

1. Register a user. During registration, Location and Phone are optional.
   - Registration will create both a User and an Employee linked together.
2. Log in. A refresh token is stored in an HttpOnly cookie; access token is kept in memory.
3. Directory page:
   - Use Department filter or search by name, email, phone, job title, department, location.
   - Click a card to open the employee profile.
4. Editing:
   - ADMIN: sees “New employee” button to add employees and can edit/delete any employee.
   - EMPLOYEE: sees a “Profile” link and can edit their own profile inline (no delete).
5. Logout from the navbar.
6. You can log in as an admin using predefined admin credentials.

## API Overview

- `POST /api/auth/register` – Register new user + employee (requires jobTitle, department)
- `POST /api/auth/login` – Obtain access token; sets HttpOnly refresh cookie
- `POST /api/auth/refresh-token` – Issue new access token; also returns user payload
- `POST /api/auth/logout` – Clears refresh token cookie
- `GET /api/employees` – List employees with search/filter/pagination
- `GET /api/employees/:id` – Get employee by id
- `POST /api/employees` – ADMIN only, create employee
- `PUT /api/employees/:id` – ADMIN or owner, update employee/user fields
- `DELETE /api/employees/:id` – ADMIN only, deletes associated user (cascade removes employee)

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL (Supabase)
- Frontend: React, Vite, Tailwind CSS
- Validation: Zod
- Auth: JWT access + refresh tokens, HttpOnly cookie for refresh

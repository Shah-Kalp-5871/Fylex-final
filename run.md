# Running the Fylex Project

This document provides instructions on how to start the development servers for both the backend and frontend of the Fylex project.

## Prerequisites
- Node.js installed
- PostgreSQL database running with the `fylex` database available.
- Ensure the `nest_/.env` file is properly configured with your database URL (e.g., `DATABASE_URL="postgresql://postgres:kalp@123@localhost:5432/fylex?schema=public"`).

## 1. Start the Backend (NestJS)

The backend is located in the `nest_` directory. Open a terminal and run:

```bash
cd nest_
npm run start:dev
```
This will start the NestJS development server with hot-reload enabled.

## 2. Start the Frontend (Next.js)

The frontend is located in the `next_` directory. Open a second terminal window and run:

```bash
cd next_
npm run dev
```
This will start the Next.js frontend on port `3002` (as configured in the package.json scripts).

## Database Commands (Prisma)

If you need to update the database schema in the future, use the following Prisma commands from inside the `nest_` directory:

- **Migrate Database:** `npx prisma migrate dev` (Applies schema changes and updates Prisma Client)
- **Seed Database:** `npx prisma db seed` (Populates the database with initial data)
- **Prisma Studio:** `npx prisma studio` (Opens a web UI to view and edit your database records)

---
> Last updated: 2026-06-26 — Redeployed on new unified monorepo (Fylex-final)

# University Admission Management System (SAMS)

A production-ready SaaS-grade student admission management platform built with React, Tailwind CSS, Node.js, Express, PostgreSQL, Prisma, JWT, and modern security best practices.

## Features

- Student registration, email verification, login, password reset
- Multi-step admission wizard with auto-save drafts
- Document upload, preview, verification, and audit log tracking
- Admin dashboards with analytics and advanced filtering
- Role-based access control, rate limiting, helmet, validation, secure file upload
- Responsive design with glassmorphism, dark mode, and mobile-first layouts

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

```bash
cp backend/.env.example backend/.env
```

3. Create your PostgreSQL database and update `backend/.env`

4. Generate Prisma client and push schema

```bash
cd backend
npx prisma generate
npx prisma db push
```

5. Seed the database

```bash
npm run seed
```

5. Start the app

```bash
npm run dev
```

6. Visit the frontend at `http://localhost:5173`

## Project Structure

- `backend/` - Express API, Prisma ORM, authentication, uploads, reports
- `frontend/` - React + Vite app, Tailwind UI, dashboard pages, auth flow
- `prisma/` - Database schema and migrations

## Deployment

The backend can be deployed to any Node.js hosting provider with a PostgreSQL database. The frontend builds to a static directory using Vite and can be deployed to static hosts.

## student
username: student1@sams.edu
password: Student@1234

# Admin credentials:                          
 superadmin@sams.edu 
 SuperAdmin@2026

# Check Student table :- In Supabase SQL Editor run:

SELECT COUNT(*) FROM "Student";


# Check AdmissionForm table

SELECT COUNT(*) FROM "AdmissionForm";


# Updated process

UPDATE "UploadedDocument"
SET verified = true;


# for verification process

UPDATE "UploadedDocument"
SET "verificationStatus"='Approved';



# for the 
SELECT
"id",
"documentName",
"publicUrl",
"filePath",
"fileName"
FROM "UploadedDocument";
# Skill-to-Job Matching Platform

Java full-stack MVP based on the supplied project description.

## Technology
- Frontend: React + Vite + CSS
- Backend: Java 17, Spring Boot, Spring Data JPA, Spring Security
- Database: MySQL
- API style: REST / JSON

## Features
- Student and recruiter registration/login (demo JWT-free sessionless authentication endpoint)
- Student profile and skills
- Recruiter job posting
- Rule-based skill matching with percentage
- Job applications and status tracking
- Role-based endpoint checks through the authenticated user's role in request payloads (MVP limitation; see Security note)

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- MySQL 8+

## 1. Create the database
Run in MySQL:
```sql
CREATE DATABASE skill_job_platform;
```

## 2. Configure backend
Edit `backend/src/main/resources/application.properties` and set your MySQL username/password.
Then run:
```bash
cd backend
mvn spring-boot:run
```
Backend: http://localhost:4000

The database tables are created/updated by Hibernate on startup.

## 3. Run frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually http://localhost:5173.

## Demo flow
1. Register as a student, add skills, then open Jobs to view match scores.
2. Register a second account as recruiter, create a job with required skills.
3. Apply to a job as student; recruiter can review applications in the recruiter panel.

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/jobs`
- `POST /api/jobs` (recruiter)
- `GET /api/jobs/matches/{studentId}`
- `GET /api/students/{id}`
- `PUT /api/students/{id}`
- `POST /api/applications`
- `GET /api/applications/student/{studentId}`
- `GET /api/applications/recruiter/{recruiterId}`
- `PATCH /api/applications/{id}/status`

## Security note
This is an educational MVP scaffold. Before deployment, add JWT or server-side sessions, Spring Security filters, authorization checks based on the authenticated principal (not IDs sent by the browser), rate limiting, email verification, HTTPS, upload validation, and production secrets management. Passwords are BCrypt-hashed; never store plaintext passwords.

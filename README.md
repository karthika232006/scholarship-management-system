# Scholarship Management System (MERN)

A full digital workflow for scholarship applications: students apply online,
and a two-stage authority process (verification, then approval) reviews and
tracks every application with a full audit trail.

Built with **MongoDB, Express, React (Vite), Node.js**.

## Workflow

```
Student submits application
        │
        ▼
  under_verification  ──(verifier rejects)──►  verification_rejected
        │ (verifier approves)
        ▼
     verified  ──►  under_approval
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
          approved                rejected
              │
              ▼
          disbursed   (marked by admin)
```

Every transition is timestamped, attributed to the staff member who made it,
and stored in the application's `statusHistory`, so students can see exactly
where their application stands and authorities have a transparent audit
trail.

## Roles

| Role       | Can do |
|------------|--------|
| `student`  | Browse active scholarships, submit applications with documents, track status |
| `verifier` | Review submitted applications, verify documents or reject with a remark |
| `approver` | Give the final approve/reject decision on verified applications |
| `admin`    | Create/edit/deactivate scholarships, create staff accounts, mark approved applications as disbursed, view stats across all applications |

Public sign-up (`/register`) only creates **student** accounts. Staff
accounts (`verifier`, `approver`, `admin`) are created by an existing admin
via `POST /api/auth/create-staff`, or by the seed script below.

## Project structure

```
scholarship-system/
├── backend/     Express API + MongoDB models
└── frontend/    React (Vite + Tailwind) client
```

## Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - Local: install MongoDB Community Edition and run `mongod`, or
  - Free cloud instance: [MongoDB Atlas](https://www.mongodb.com/atlas)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI to your local or Atlas connection string,
# and set JWT_SECRET to a long random string
npm run seed     # creates demo accounts + sample scholarships (optional but recommended)
npm run dev       # starts the API on http://localhost:5000
```

The seed script creates these accounts so you can test the full workflow
immediately:

| Role     | Email                       | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@scholarship.edu        | Admin@123    |
| Verifier | verifier@scholarship.edu     | Verify@123   |
| Approver | approver@scholarship.edu     | Approve@123  |
| Student  | student@scholarship.edu      | Student@123  |

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to
`http://localhost:5000`, so no extra CORS configuration is needed in
development (see `vite.config.js`).

## 3. Try the full workflow

1. Log in as **admin**, go to *Manage Scholarships*, and confirm the seeded
   scholarships are there (or create a new one).
2. Log in as **student** (or register a new one), apply to a scholarship,
   attach a document, and submit.
3. Log in as **verifier**, open the application from the verification queue,
   and verify it (or reject it with a remark).
4. Log in as **approver**, open the now-forwarded application, and approve
   or reject it.
5. Log in as **admin**, mark the approved application as *disbursed*.
6. Log back in as the student and check *My Applications* — the full status
   timeline with every remark and timestamp is visible.

## API overview

| Method | Endpoint                              | Access              |
|--------|----------------------------------------|----------------------|
| POST   | `/api/auth/register`                  | Public (student only) |
| POST   | `/api/auth/login`                     | Public |
| GET    | `/api/auth/me`                        | Authenticated |
| PUT    | `/api/auth/profile`                   | Authenticated |
| POST   | `/api/auth/create-staff`              | Admin |
| GET    | `/api/scholarships`                   | Authenticated |
| POST   | `/api/scholarships`                   | Admin |
| PUT    | `/api/scholarships/:id`               | Admin |
| DELETE | `/api/scholarships/:id`               | Admin |
| POST   | `/api/applications`                   | Student (multipart, field `documents`) |
| GET    | `/api/applications/mine`              | Student |
| GET    | `/api/applications`                   | Verifier / Approver / Admin (role-scoped queue) |
| GET    | `/api/applications/:id`               | Owner or staff |
| PATCH  | `/api/applications/:id/verify`        | Verifier (`{ decision: 'verified'|'rejected', remark }`) |
| PATCH  | `/api/applications/:id/decide`        | Approver (`{ decision: 'approved'|'rejected', remark }`) |
| PATCH  | `/api/applications/:id/disburse`      | Admin |
| GET    | `/api/applications/stats/summary`     | Admin |

## Notes for production deployment

- Set a strong, unique `JWT_SECRET`.
- Serve uploaded documents from cloud storage (e.g. S3) instead of local
  disk for anything beyond a demo/single-server deployment.
- Put the frontend build (`npm run build` → `frontend/dist`) behind a static
  host or CDN, and point it at your deployed API URL (update the axios
  `baseURL` or use an environment variable + reverse proxy).
- Restrict CORS (`CLIENT_URL` in `.env`) to your real frontend origin.

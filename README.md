# Full-Stack-App

Full-stack React and Node.js application with a TypeScript Express API.

## Project Components

- React frontend in `frontend/`
- Node.js backend API in `backend/`
- Dockerfiles for frontend and backend containers
- Pulumi AWS infrastructure in `infra/`
- GitHub Actions CI/CD workflow in `.github/workflows/deploy.yml`
- Deployment guide in `docs/deployment.md`

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Build both applications:

```bash
npm run build
```

Run the backend:

```bash
npm run start:backend
```

Run the frontend in a separate terminal:

```bash
npm run dev:frontend
```

The frontend runs at `http://localhost:3000`.
The backend API runs at `http://localhost:3001/api`.

## Environment

Copy `backend/.env.example` to `backend/.env` when connecting to PostgreSQL.
Without database settings, the API returns local sample data so the app still runs.

Copy `frontend/.env.example` to `frontend/.env` to point the frontend at a deployed API.

## Docker

Build the backend image:

```bash
docker build -t full-stack-backend ./backend
```

Build the frontend image:

```bash
docker build -t full-stack-frontend ./frontend
```

## Deployment

See `docs/deployment.md` for the full Pulumi, AWS, GitHub Actions, security, monitoring, and video submission checklist.

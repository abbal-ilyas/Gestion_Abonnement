# Subscription Management Stack

Full-stack scaffold for subscriptions, subscribers, notifications, and configuration in Codespaces.

## Stack
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS, i18n (en/fr/ar)
- Backend: Java 17, Spring Boot 3 (REST, Spring Security JWT), Postgres
- Tooling: Docker Compose, devcontainer-ready for Codespaces

## Quick start (Codespaces/local)
1) Copy environment: `cp .env.example .env`
2) Build & run everything: `docker compose up --build`
	- Frontend: http://localhost:3000
	- Backend API: http://localhost:8080/api
	- Postgres: localhost:5432 (db name `subscriptions`)

### Running without Docker
- Backend: `cd backend && ./mvnw spring-boot:run`
- Frontend: `cd frontend && npm install && npm run dev`

## Credentials & seeds
- Default admin user: `admin` / `admin123`
- Seeded subscribers and subscriptions are created at startup (see DataInitializer).

## Environment
- `.env.example` contains all variables (DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET base64, CORS_ALLOWED_ORIGINS, NEXT_PUBLIC_API_BASE_URL, BACKEND_INTERNAL_URL, optional NEXT_PUBLIC_API_TOKEN).
- Frontend uses `NEXT_PUBLIC_API_USERNAME` and `NEXT_PUBLIC_API_PASSWORD` for automatic JWT login in dev (defaults: `admin`/`admin123`).
- JWT secret must be base64; default `c3Vic2NyaXB0aW9uLWRldi1zZWNyZXQta2V5LTI1Ni1iaXRzLXRva2Vu` is fine for local.

## Frontend structure (src/)
- `app/[locale]/` pages: home, subscriptions, subscribers, notifications, config
- `components/`: forms, filters, nav, cards, notifications
- `lib/api.ts`: client-side API helpers with sample-data fallback
- `i18n/`: locale config and dictionaries (en/fr/ar)

## Backend highlights
- Entities: Subscriber, Subscription (with status), AppUser
- Controllers: `/api/auth/login`, `/api/subscribers`, `/api/subscriptions`, `/api/notifications/daily`
- Security: JWT bearer, stateless, CORS with comma-separated allowed origins
- Seeds: admin user + demo subscribers/subscriptions

## Devcontainer
- `.devcontainer/devcontainer.json` wires Node 20 + Java 17, uses docker-compose services, forwards 3000/8080/5432.

## Next steps
- Wire config page selections to backend persistence
- Add tests (Spring Boot and React) and validation/error surfaces on forms
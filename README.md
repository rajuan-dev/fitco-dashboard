# Fitco Dashboard

Fitco dashboard is a React + Vite admin panel for managing users, subscriptions, reports, CMS pages, and public legal pages.

## Quick Start

### Option 1: Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Dashboard runs on:

`http://localhost:5173`

### Option 2: Run with Docker

From the repository root:

```bash
docker compose up -d --build dashboard backend mongo
```

Then open:

`http://localhost/`

## Environment Setup

Create `.env` from the example:

```bash
cp .env.example .env
```

Recommended local value:

`VITE_API_BASE_URL=http://localhost:5000`

Recommended Docker value:

`VITE_API_BASE_URL=/`

Other values:

- `VITE_API_TIMEOUT_MS=15000`
- `VITE_API_USE_MOCKS_ON_ERROR=false`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Routes

### Auth

- `/auth/login`
- `/auth/otp`
- `/auth/forgot-password`
- `/auth/reset-password`

### Admin

- `/admin/dashboard`
- `/admin/users`
- `/admin/users/blocked`
- `/admin/earnings`
- `/admin/subscriptions`
- `/admin/reports`
- `/admin/profile`
- `/admin/settings`

### Public Pages

- `/legal`
- `/about`
- `/privacy-policy`
- `/terms-and-conditions`

## Backend Connection

The dashboard expects the Fitco backend to be available.

If `VITE_API_BASE_URL=/`, the dashboard sends requests to the same domain and expects a reverse proxy to forward `/api/*` to the backend.

That behavior is already configured in Docker with:

- [nginx.conf](/D:/RAJUAN-PERSONAL/VSCODE/fitco/fitco-dashboard/nginx.conf)

## Production Notes

- Keep `VITE_API_USE_MOCKS_ON_ERROR=false`
- Build the dashboard with the correct API base URL
- Use the root `docker-compose.yml` if you want the easiest server deployment

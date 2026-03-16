# Fitco Dashboard

Fitco dashboard is a React + Vite admin panel for managing users, subscriptions, reports, CMS pages, and public legal pages.

## Production Deployment

This dashboard is intended to run as its own service in production.

Production layout:

- dashboard container on port `8080`
- reverse proxy in front such as Nginx
- backend hosted separately, usually at `https://api.yourdomain.com`

### 1. Configure environment

Create the dashboard environment file:

```bash
cp .env.example .env
```

Recommended production values:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT_MS=15000
VITE_API_USE_MOCKS_ON_ERROR=false
```

Important:

- `VITE_API_BASE_URL` is a build-time value
- if you change it, rebuild the dashboard container

### 2. Build and run with Docker

From the repository root:

```bash
docker compose -f docker-compose.dashboard.yml up -d --build
```

### 3. Verify the container

View logs:

```bash
docker compose -f docker-compose.dashboard.yml logs -f
```

Container URL:

`http://127.0.0.1:8080`

### 4. Expose it through a reverse proxy

Typical production mapping:

- `admin.yourdomain.com` -> `127.0.0.1:8080`

Use:

- [deploy/nginx/fitco.conf.example](/D:/RAJUAN-PERSONAL/VSCODE/fitco/deploy/nginx/fitco.conf.example)

## Daily Deploy Commands

Rebuild after dashboard changes:

```bash
docker compose -f docker-compose.dashboard.yml up -d --build
```

Stop dashboard:

```bash
docker compose -f docker-compose.dashboard.yml down
```

## Local Development

```bash
cp .env.example .env
npm install
npm run dev
```

Local URL:

`http://localhost:5173`

Recommended local API value:

`VITE_API_BASE_URL=http://localhost:5000`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Routes

- `/auth/login`
- `/auth/otp`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/admin/dashboard`
- `/admin/users`
- `/admin/users/blocked`
- `/admin/earnings`
- `/admin/subscriptions`
- `/admin/reports`
- `/admin/profile`
- `/admin/settings`
- `/legal`
- `/about`
- `/privacy-policy`
- `/terms-and-conditions`

## Important Notes

- The dashboard container serves static files only
- It does not proxy requests to the backend container internally
- Production depends on `VITE_API_BASE_URL` being set correctly before build
- Keep `VITE_API_USE_MOCKS_ON_ERROR=false` in production

# Fitco Admin Dashboard API Contracts

Set `VITE_API_BASE_URL` to your backend origin (example: `http://localhost:5000`).
The dashboard app calls admin endpoints under `/api/v1/*`.

## Auth (Admin)
- `POST /api/v1/auth/admin/login`
  - request: `{ "email": string, "password": string }`
  - response: `{ "accessToken": string, "refreshToken": string, "user": object }`
- `POST /api/v1/admin/forgot-password`
  - request: `{ "email": string }`
- `POST /api/v1/admin/verify-reset-otp`
  - request: `{ "email": string, "otp": string }`
- `POST /api/v1/admin/reset-password`
  - request: `{ "email": string, "otp": string, "newPassword": string }`
- `PATCH /api/v1/admin/password`
  - request: `{ "currentPassword": string, "newPassword": string }`

## Dashboard
- `GET /api/v1/dashboard/totals`
- `GET /api/v1/dashboard/user-ratio?year=YYYY`
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/transactions?page=1&limit=300`

## Users
- `GET /api/v1/users?page=1&limit=300`
- `PATCH /api/v1/users/:id/block`
- `PATCH /api/v1/users/:id/unblock`

## Subscriptions
- `GET /api/v1/subscriptions?page=1&limit=300`
- `GET /api/v1/dashboard/subscription-pricing`
- `PATCH /api/v1/dashboard/subscription-pricing`

## Reports
- `GET /api/v1/reports`
- `POST /api/v1/reports/actions/warn`
- `POST /api/v1/reports/actions/disable`
- `POST /api/v1/reports/actions/unblock`

## Profile + CMS
- `GET /api/v1/admin/profile`
- `PATCH /api/v1/admin/profile`
- `GET /api/v1/cms`
- `PATCH /api/v1/cms/privacy-policy` with `{ "text": string }`
- `PATCH /api/v1/cms/about-us` with `{ "text": string }`
- `PATCH /api/v1/cms/terms-conditions` with `{ "text": string }`

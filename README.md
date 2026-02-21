# Fitco Dashboard Frontend

React + Vite implementation of the Fitco dashboard and auth screens from the provided design PDF.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Routing

This project uses a lightweight custom router based on `window.history`.

### Auth
- `/auth/login`
- `/auth/otp`
- `/auth/forgot-password`
- `/auth/reset-password`

### Admin
- `/admin/dashboard`
- `/admin/users`
- `/admin/users/blocked`
- `/admin/users/details`
- `/admin/users/confirm-block`
- `/admin/earnings`
- `/admin/earnings/transaction`
- `/admin/subscriptions`
- `/admin/subscriptions/manage-fees`
- `/admin/reports`
- `/admin/profile`
- `/admin/settings`
- `/admin/settings/change-password`
- `/admin/settings/forgot-password`
- `/admin/settings/verify-otp`
- `/admin/settings/privacy-policy`
- `/admin/settings/about-us`
- `/admin/settings/terms`
- `/admin/logout-confirm`

## Backend Integration

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
2. Ensure backend endpoints follow `src/services/CONTRACTS.md`.
3. If backend is not available, mock data is used automatically.

## Auth Guard

- Admin routes are protected by token presence in `localStorage` (`fitco_auth_token`).
- Logging out clears the token and redirects to `/auth/login`.

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

## Project Structure (Admin)

```txt
src/
  features/admin/
    dashboard/
      DashboardPage.jsx
      components/UserRatioChart.jsx
    users/UsersPage.jsx
    earnings/EarningsPage.jsx
    subscriptions/SubscriptionsPage.jsx
    reports/ReportsPage.jsx
    settings/SettingsPage.jsx
    shared/TableControls.jsx
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
2. Optional: set `VITE_API_TIMEOUT_MS` (default: `15000`).
3. Keep `VITE_API_USE_MOCKS_ON_ERROR=false` for production.
4. Ensure backend endpoints follow `src/services/CONTRACTS.md`.
5. If backend is not available and `VITE_API_BASE_URL` is empty, mock data is used automatically.

### API Behavior

- No `VITE_API_BASE_URL`: always use local mock data.
- With `VITE_API_BASE_URL`:
  - default: real API errors are surfaced to UI.
  - if `VITE_API_USE_MOCKS_ON_ERROR=true`: failed API calls fallback to mock payloads.

## Auth Guard

- Admin routes are protected by token presence in `localStorage` (`fitco_auth_token`).
- Logging out clears the token and redirects to `/auth/login`.

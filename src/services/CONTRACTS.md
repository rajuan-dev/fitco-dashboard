# Fitco Frontend API Contracts

Set `VITE_API_BASE_URL` to use live backend APIs. Without it, mock data is used.

## Auth
- `POST /auth/login`
  - request: `{ "email": string, "password": string }`
  - response: `{ "token": string, "user"?: object }`
- `POST /auth/verify-otp`
  - request: `{ "email": string, "otp": string }`
  - response: `{ "token": string, "user"?: object }`
- `POST /auth/forgot-password`
  - request: `{ "email": string }`
  - response: `{ "success": boolean }`
- `POST /auth/reset-password`
  - request: `{ "email": string, "password": string, "confirmPassword": string }`
  - response: `{ "success": boolean }`

## Dashboard
- `GET /dashboard`
  - accepted keys: `totalUsers | total_users | usersTotal`
  - accepted keys: `totalRevenue | total_revenue | revenueTotal`
  - accepted keys: `userRatio | user_ratio | monthlyUsers`

## Users
- `GET /users`
- `GET /users/blocked`
  - accepted row keys: `id | sid`, `name | fullName | full_name`, `email`, `phone | phoneNo | phone_no`, `joinedDate | joined_date | date`

## Earnings
- `GET /earnings`
  - accepted keys: `today | today_amount`, `thisMonth | this_month`, `totalRevenue | total_revenue`
- `GET /earnings/transactions`
  - accepted row keys: `id | sid`, `name | userName | user_name`, `trxId | transaction_id`, `plan | plans`, `price | amount`, `date | created_at`

## Subscriptions
- `GET /subscriptions`
  - accepted row keys: `id | sid`, `name | userName | user_name`, `email`, `status`, `plan | plans`, `expirationDate | expiration_date | date`

## Reports
- `GET /reports`
  - accepted row keys: `id | sid`, `name | reportFrom | report_from`, `email`, `reason | reportReason | report_reason`, `reportedAt | date | created_at`

## Profile
- `GET /profile`
  - accepted keys: `username | userName | user_name`, `email`, `contactNo | contact_no | phone`, `name | fullName`

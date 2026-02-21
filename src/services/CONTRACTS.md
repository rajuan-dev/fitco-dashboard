# Fitco Frontend API Contracts

Set `VITE_API_BASE_URL` to use live backend APIs. Without it, mock data is used.
If `VITE_API_USE_MOCKS_ON_ERROR=true`, failed live requests fallback to mocks.

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
  - accepted row keys: `id | sid | userId | user_id`, `name | fullName | full_name | userName | user_name`, `email`, `phone | phoneNo | phone_no`, `joinedDate | joined_date | date | created_at`

## Earnings
- `GET /earnings`
  - accepted keys: `today | today_amount`, `thisMonth | this_month`, `totalRevenue | total_revenue | revenueTotal | revenue_total`
- `GET /earnings/transactions`
  - accepted row keys: `id | sid | transactionId | transaction_id`, `userId | user_id`, `name | userName | user_name | fullName | full_name`, `trxId | transaction_id | transactionId | reference`, `plan | plans | package | subscriptionPlan`, `price | amount | totalAmount | total_amount`, `date | created_at | createdAt`

## Subscriptions
- `GET /subscriptions`
  - accepted row keys: `id | sid | subscriptionId | subscription_id`, `userId | user_id`, `name | userName | user_name | fullName | full_name`, `email`, `status | paymentStatus | payment_status`, `plan | plans | subscriptionPlan | package`, `expirationDate | expiration_date | date | endDate | end_date`

## Reports
- `GET /reports`
  - accepted row keys: `id | sid | reportId | report_id`, `userId | user_id | reportedUserId | reported_user_id`, `name | reportFrom | report_from | reportedByName | reported_by_name`, `email | reportedByEmail | reported_by_email`, `reason | reportReason | report_reason`, `reportedAt | date | created_at | createdAt`
- `POST /reports/actions/warn`
  - request: `{ "userId"?: string|number, "reportId": string|number, "reason"?: string }`
  - response: `{ "success": boolean, "message"?: string }`
- `POST /reports/actions/disable`
  - request: `{ "userId": string|number, "reportId": string|number, "reason"?: string }`
  - response: `{ "success": boolean, "message"?: string }`
- `POST /reports/actions/unblock`
  - request: `{ "userId": string|number, "reportId": string|number }`
  - response: `{ "success": boolean, "message"?: string }`

## Profile
- `GET /profile`
  - accepted keys: `username | userName | user_name`, `email`, `contactNo | contact_no | phone`, `name | fullName | full_name`

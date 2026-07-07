# RentNest 🏠

**Find & List Rental Properties with Ease**

A backend REST API for a rental property marketplace. Landlords list properties, tenants submit rental requests and make payments, admins oversee the platform.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT |
| Validation | Zod |
| Payment | Stripe / SSLCommerz |

---

## Getting Started

```bash
git clone <repo-url>
cd rentnest
npm install
cp .env.example .env   # fill in values
npx prisma migrate dev
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Properties

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/properties` | Public |
| GET | `/api/properties/:id` | Public |
| GET | `/api/categories` | Public |

### Landlord

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/landlord/properties` | Landlord |
| PUT | `/api/landlord/properties/:id` | Landlord |
| DELETE | `/api/landlord/properties/:id` | Landlord |
| GET | `/api/landlord/requests` | Landlord |
| PATCH | `/api/landlord/requests/:id` | Landlord |

### Rental Requests

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/rentals` | Tenant |
| GET | `/api/rentals` | Tenant |
| GET | `/api/rentals/:id` | Tenant |

### Payments

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/payments/create` | Tenant |
| POST | `/api/payments/confirm` | Tenant |
| POST | `/api/payments/webhook` | Stripe (raw) |
| GET | `/api/payments` | Tenant |
| GET | `/api/payments/:id` | Tenant |

### Reviews

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/reviews` | Tenant (post-payment only) |
| GET | `/api/reviews/property/:propertyId` | Public |

### Admin

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/properties` | Admin |
| GET | `/api/admin/rentals` | Admin |

---

## Roles

| Role | Permissions |
|------|-------------|
| **TENANT** | Browse properties, submit rental requests, pay, leave reviews |
| **LANDLORD** | Manage listings, approve or reject rental requests |
| **ADMIN** | Platform oversight, user management, category management |
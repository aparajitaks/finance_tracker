# Personal Finance Tracker API

A production-ready RESTful backend for tracking personal finances, built with Node.js, Express, and Prisma (PostgreSQL).

## Features

- **User Authentication**: Secure JWT-based registration and login.
- **Category Management**: Organized categories for income and expenses.
- **Transaction Tracking**: Create, read, update, and delete transactions.
- **Budgeting System**: Set monthly spending limits per category and track remaining balances.
- **Dynamic Dashboard**: Real-time stats for total income, expenses, and savings.
- **Monthly Reports**: Chronological breakdown of financial health.
- **Profile Management**: Update user details.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT, Bcrypt
- **Deployment**: Render/Railway ready

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Configure Environment**: Create a `.env` file (see `.env.example`)
4. **Setup Database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
5. **Start Server**: `npm start` or `node index.js`

## API Endpoints

### Auth
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Transactions
- `GET /transactions` - List all transactions
- `POST /transactions` - Create a transaction
- `PUT /transactions/:id` - Update a transaction
- `DELETE /transactions/:id` - Delete a transaction

### Categories
- `GET /categories` - List categories
- `POST /categories/seed` - Seed default categories

### Budgets
- `GET /budgets` - List budgets with spending stats
- `POST /budgets` - Create/Update a budget limit

### Dashboard
- `GET /dashboard` - Current totals
- `GET /dashboard/report` - Monthly breakdown

## Edge Case Handling

- **Decimal Precision**: Amounts are handled as `Float` in Prisma.
- **Validation**: Strict validation for required fields and valid types.
- **Relational Integrity**: Prevents deleting categories that are linked to transactions.
- **Idempotent Seeding**: Category seeding can be run multiple times without duplicates.

## License
MIT

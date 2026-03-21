# Diamond Industry Accounting Software

A web-based Diamond Industry Accounting Software skeleton built using **Laravel** (backend) and **React.js** (frontend), designed for diamond business accounting, stock management, and reporting.

---

## Table of Contents

- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [Modules](#modules)  
- [Project Structure](#project-structure)  
- [API Endpoints](#api-endpoints)  
- [Database Schema](#database-schema)  
- [Installation](#installation)  
- [Optional Features](#optional-features)  
- [License](#license)  

---

## Tech Stack

- **Backend:** Laravel (PHP)  
- **Frontend:** React.js  
- **Database:** MySQL / PostgreSQL  
- **Realtime & Notifications (Optional):** Node.js, Pusher  
- **Charts / Reports:** Chart.js or D3.js  
- **Authentication:** Laravel Sanctum / Passport  

---

## Features

- Multi-user system with role-based access  
- Multi-branch & multi-currency support  
- Full diamond accounting workflow (purchase, sell, loans, payroll, etc.)  
- Interactive charts & reports with export options (PDF/Excel)  
- Audit trail for all transactions  
- RAPNET integration (optional)  
- Fingerprint access module (optional)  
- Automatic emailing of reports  

---

## Modules

### Entries
- Purchase  
- Sell  
- Payment  
- Expense  
- Loan  
- UCHINA  
- OD Ledger  
- Salary  
- Lab IR  
- RAPNET Upload  
- Memo  
- Brokerage  
- Bill  
- Assortment  

### Reports
- Total Purchase / Sell  
- Outstanding  
- Stock Report  
- Ledger  
- Profit & Loss  
- Balance Sheet  
- Trial Balance  
- Expense Report  
- Payroll Report  
- Assortment Report  
- Kapan Report  
- Lab IR Report  
- Rough Costing Avg Report  

### Utilities
- Multi-user with roles  
- Multi-branch & multi-currency  
- Auto rate difference calculation  
- Fingerprint access integration  
- Email notifications to clients  

---


---

## API Endpoints (Example)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/login` | User login |
| GET    | `/api/purchase` | List all purchases |
| POST   | `/api/purchase` | Create new purchase |
| GET    | `/api/sell` | List all sells |
| POST   | `/api/sell` | Create new sell |
| GET    | `/api/ledger` | View ledger |
| GET    | `/api/reports/stock` | Stock report |
| GET    | `/api/reports/profit-loss` | P&L report |
| ...    | ... | ... other modules |

> All endpoints are secured with **Laravel Sanctum** / **Passport** and role-based permissions.

---

## Database Schema

Main tables:

- `users`  
- `roles`  
- `branches`  
- `entries` (purchase, sell, payment, etc.)  
- `ledger`  
- `stock`  
- `payroll`  
- `reports`  
- `currency_rates`  

> Sample migrations and seeders are included for testing.

---

## Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

cd frontend
npm install
npm start
    
# HRMS Client Portal (Frontend)

This is the standalone React frontend client for the **Human Resource Management System (HRMS)**. It is built using **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, and **React Query**.

---

## Technical Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & custom shadcn/ui custom variables
- **Navigation**: React Router DOM (v7)
- **API Connection**: Axios (with global interceptors & auth guards)
- **Data Caching**: TanStack React Query (v5)
- **Global State**: Zustand (for light/dark theme toggle, session token storage, and logout dispatch)
- **Forms & Validation**: React Hook Form & Zod
- **Visuals & Charts**: Recharts, Framer Motion, and Lucide React Icons
- **User Alerts**: React Hot Toast

---

## Project Structure

```
src/
 ├── assets/          # Static logos/assets
 ├── components/      # Reusable controls (Table, Loader, EmptyState, DatePicker)
 ├── layouts/         # Frame structures (AuthLayout, DashboardLayout)
 ├── pages/           # Pages (auth login/register, admin control, employee portal)
 ├── routes/          # AppRoutes configuration and ProtectedRoute guards
 ├── services/        # Axios API configurations and React Query hooks
 ├── store/           # Zustand state configurations (authStore, themeStore)
 ├── styles/          # Stylesheet overrides (index.css)
 ├── types/           # TS Interfaces
 └── utils/           # Helper utilities (date formatter, cn class merger)
```

---

## Installation & Setup

### Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### Configuration
Create a `.env` file in the root of the `frontend` folder (or copy from `.env.example`):
```properties
VITE_API_URL=http://localhost:8080/api
```

### Installation
From the `frontend` folder, install the package dependencies:
```bash
npm install
```

### Running Locally
Start the local development server:
```bash
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

---

## Role-Based Access Credentials

- **Employee Portal**: Login with any registered employee account. Employees can view their dashboard metrics, clock in/out, check history, submit leave requests, and view/print monthly payslips.
- **Admin Dashboard**: Login with an administrator account (or register as an admin). Admins can view complete operation rosters, search employee cards, perform CRUD actions on profiles, approve/reject leaves queue with comments, adjust salary schemas, and batch generate payrolls.

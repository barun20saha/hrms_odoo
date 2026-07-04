import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'

// Guards
import { ProtectedRoute } from './ProtectedRoute'

// Guest Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// Employee Portal Pages
import EmployeeDashboard from '../pages/employee/Dashboard'
import EmployeeProfile from '../pages/employee/Profile'
import EmployeeAttendance from '../pages/employee/Attendance'
import EmployeeLeaves from '../pages/employee/Leaves'
import EmployeePayroll from '../pages/employee/Payroll'

// Admin Portal Pages
import AdminDashboard from '../pages/admin/Dashboard'
import AdminEmployees from '../pages/admin/Employees'
import AdminAttendance from '../pages/admin/Attendance'
import AdminLeaves from '../pages/admin/Leaves'
import AdminPayroll from '../pages/admin/Payroll'

// Error Pages
import NotFound from '../pages/errors/NotFound'
import Forbidden from '../pages/errors/Forbidden'
import ServerError from '../pages/errors/ServerError'

import { useAuthStore } from '../store/authStore'

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  // Base Redirect logic for "/"
  const getHomeRedirect = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return role === 'ROLE_ADMIN' 
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/employee/dashboard" replace />
  }

  return (
    <Routes>
      {/* Root Path redirect */}
      <Route path="/" element={getHomeRedirect()} />

      {/* Guest Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Employee Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/leaves" element={<EmployeeLeaves />} />
          <Route path="/employee/payroll" element={<EmployeePayroll />} />
        </Route>
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/leaves" element={<AdminLeaves />} />
          <Route path="/admin/payroll" element={<AdminPayroll />} />
        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
export default AppRoutes;

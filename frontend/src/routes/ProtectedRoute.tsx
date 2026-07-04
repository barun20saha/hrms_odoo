import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: ('ROLE_EMPLOYEE' | 'ROLE_ADMIN')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

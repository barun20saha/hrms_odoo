import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  if (isAuthenticated) {
    const redirectPath = role === 'ROLE_ADMIN' ? '/admin/dashboard' : '/employee/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/30">
            H
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">HRMS Portal</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Every workday, perfectly aligned.</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

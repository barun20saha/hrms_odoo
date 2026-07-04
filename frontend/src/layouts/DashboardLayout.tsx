import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileSpreadsheet,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen
} from 'lucide-react'

export const DashboardLayout: React.FC = () => {
  const { role, email, setLogout } = useAuthStore()
  const { theme, toggleTheme, initializeTheme } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    initializeTheme()
  }, [])

  const handleLogout = () => {
    setLogout()
    navigate('/login')
  }

  const isAdmin = role === 'ROLE_ADMIN'

  // Dynamic Sidebar Links based on role
  const links = isAdmin
    ? [
        { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/employees', name: 'Employees', icon: Users },
        { path: '/admin/attendance', name: 'Attendance', icon: Calendar },
        { path: '/admin/leaves', name: 'Leave Approvals', icon: FileSpreadsheet },
        { path: '/admin/payroll', name: 'Payroll Control', icon: CreditCard },
        { path: '/admin/accounts', name: 'My Accounts', icon: BookOpen },
      ]
    : [
        { path: '/employee/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/employee/profile', name: 'My Profile', icon: User },
        { path: '/employee/attendance', name: 'Attendance History', icon: Calendar },
        { path: '/employee/leaves', name: 'Apply Leave', icon: FileSpreadsheet },
        { path: '/employee/payroll', name: 'My Salaries', icon: CreditCard },
        { path: '/employee/accounts', name: 'My Accounts', icon: BookOpen },
      ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex transition-colors duration-300">
      {/* --- DESKTOP SIDEBAR --- */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border-r border-gray-100 dark:border-slate-800 shrink-0 select-none relative"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
              H
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg tracking-wider text-gray-800 dark:text-white"
              >
                HRMS
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-400 absolute -right-3 top-5 border border-gray-100 dark:border-slate-700 shadow-md"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-slate-400 dark:group-hover:text-slate-100'} />
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {link.name}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 group"
          >
            <LogOut size={20} className="group-hover:text-red-500" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MOBILE DRAWER SIDEBAR --- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 z-50 flex flex-col md:hidden border-r border-gray-100 dark:border-slate-800"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                    H
                  </div>
                  <span className="font-bold text-lg tracking-wider text-gray-800 dark:text-white">HRMS</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-100 p-1">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1">
                {links.map((link) => {
                  const Icon = link.icon
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                      <span>{link.name}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT FRAME --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white p-1">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notification drop */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen)
                  setProfileOpen(false)
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors duration-200"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-3 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 font-bold text-sm">
                        Recent Notifications
                      </div>
                      <div className="max-h-60 overflow-y-auto px-2 py-1">
                        <div className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-xs space-y-1 cursor-pointer">
                          <p className="font-semibold text-gray-800 dark:text-white">Welcome to the new HRMS!</p>
                          <p className="text-gray-400">Restructured project successfully deployed.</p>
                          <p className="text-[10px] text-gray-500 mt-1">Just now</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotifOpen(false)
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {email ? email.substring(0, 2).toUpperCase() : 'U'}
                </div>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50 text-sm overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                        <p className="font-semibold text-gray-800 dark:text-white truncate">{email}</p>
                        <p className="text-xs text-gray-500 truncate capitalize">{role?.replace('ROLE_', '').toLowerCase()}</p>
                      </div>
                      <Link
                        to={isAdmin ? '/admin/dashboard' : '/employee/profile'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Display Area */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

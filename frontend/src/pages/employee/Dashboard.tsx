import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  CalendarDays,
  Bell,
  ArrowRight,
  Sparkles,
  MapPin,
  Play,
  Square
} from 'lucide-react'
import { useDashboardQueries } from '../../services/queries/useDashboardQueries'
import { useAttendanceQueries } from '../../services/queries/useAttendanceQueries'
import { DashboardCard } from '../../components/DashboardCard'
import { Loader } from '../../components/Loader'
import { toast } from 'react-hot-toast'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export const Dashboard: React.FC = () => {
  const { useGetEmployeeDashboard } = useDashboardQueries()
  const { useCheckIn, useCheckOut } = useAttendanceQueries()

  const { data: dash, isLoading, error } = useGetEmployeeDashboard()
  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  const [remarks, setRemarks] = useState('')
  const [clocking, setClocking] = useState(false)

  const handleCheckIn = async () => {
    setClocking(true)
    try {
      await checkInMutation.mutateAsync(remarks)
      toast.success('Successfully checked in!')
      setRemarks('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Check-in failed')
    } finally {
      setClocking(false)
    }
  }

  const handleCheckOut = async () => {
    setClocking(true)
    try {
      await checkOutMutation.mutateAsync()
      toast.success('Successfully checked out!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Check-out failed')
    } finally {
      setClocking(false)
    }
  }

  if (isLoading) return <Loader size={40} />
  if (error || !dash) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to fetch dashboard data. Ensure backend is running.
      </div>
    )
  }

  const { profileSummary, attendanceSummary, leaveSummary, notifications } = dash

  // Chart data: Mocking attendance distribution this month
  const chartData = [
    { name: 'Presents', days: attendanceSummary.presents || 0 },
    { name: 'Half Days', days: attendanceSummary.halfDays || 0 },
    { name: 'Leaves', days: attendanceSummary.leaves || 0 },
    { name: 'Absents', days: attendanceSummary.absents || 0 },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={120} className="text-blue-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hello, {profileSummary.firstName}!
          </h2>
          <p className="text-sm text-gray-500">
            Welcome back to the portal. You are logged in as{' '}
            <span className="text-blue-600 font-semibold">{profileSummary.designation || 'Staff'}</span>.
          </p>
        </div>

        {/* Date tracker */}
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <CalendarDays size={20} className="text-blue-600" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <DashboardCard
          title="Days Present"
          value={attendanceSummary.presents || 0}
          icon={UserCheck}
          variant="blue"
          description="Total full workdays logged this month"
        />
        <DashboardCard
          title="Leave requests"
          value={leaveSummary.approved || 0}
          icon={Calendar}
          variant="emerald"
          description={`${leaveSummary.pending || 0} applications currently pending review`}
        />
        <DashboardCard
          title="Half Days & Absents"
          value={(attendanceSummary.halfDays || 0) + (attendanceSummary.absents || 0)}
          icon={Clock}
          variant="amber"
          description="Logged partial-days or missing checkins"
        />
      </div>

      {/* Core split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Clock Actions Box */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="text-blue-600" size={18} />
              <span>Shift Clock Terminal</span>
            </h3>
            <p className="text-xs text-gray-400">Record check-in/out stamps for today's logs.</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add check-in remarks (optional)..."
              className="w-full px-4 py-2 border border-gray-250 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCheckIn}
                disabled={clocking}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Play size={16} />
                <span>Clock In</span>
              </button>
              <button
                onClick={handleCheckOut}
                disabled={clocking}
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 shadow-md transition-all disabled:opacity-50"
              >
                <Square size={16} />
                <span>Clock Out</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 dark:border-slate-800 text-center">
            <Link
              to="/employee/attendance"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:gap-2.5 transition-all"
            >
              <span>View full clock logs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Center: Recharts Visual Chart */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={18} />
              <span>Attendance Distribution</span>
            </h3>
            <p className="text-xs text-gray-400">Total days recorded this month breakdown.</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0288D1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0288D1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false}/>
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip />
                <Area type="monotone" dataKey="days" stroke="#0288D1" strokeWidth={2} fillOpacity={1} fill="url(#colorDays)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer list: Notifications alerts */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="text-blue-600" size={18} />
          <span>System Bulletins</span>
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-slate-800/80">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif: any) => (
              <div key={notif.id} className="py-3.5 flex items-start gap-4 text-sm first:pt-0 last:pb-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-gray-800 dark:text-gray-200 font-semibold">{notif.message}</p>
                  <p className="text-xs text-gray-400">{notif.dateString}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-gray-400">
              No recent notifications to report.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

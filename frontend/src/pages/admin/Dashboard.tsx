import React from 'react'
import {
  Users,
  UserCheck,
  UserMinus,
  FileClock,
  Clock,
  Sparkles,
  CalendarDays,
  TrendingUp
} from 'lucide-react'
import { useDashboardQueries } from '../../services/queries/useDashboardQueries'
import { DashboardCard } from '../../components/DashboardCard'
import { Loader } from '../../components/Loader'
import { Table } from '../../components/Table'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Attendance as AttendanceType } from '../../types'

export const Dashboard: React.FC = () => {
  const { useGetAdminDashboard } = useDashboardQueries()
  const { data: dash, isLoading, error } = useGetAdminDashboard()

  if (isLoading) return <Loader size={40} />
  if (error || !dash) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to fetch admin dashboard. Make sure database is active.
      </div>
    )
  }

  const { totalEmployees, presentToday, absentToday, pendingLeaveRequests, recentAttendance } = dash

  const chartData = [
    { name: 'On Duty', count: presentToday },
    { name: 'Absent / Off', count: absentToday },
    { name: 'Total Roster', count: totalEmployees },
  ]

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId' as keyof AttendanceType,
    },
    {
      header: 'Check In Time',
      accessor: (row: AttendanceType) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-',
    },
    {
      header: 'Status Tag',
      accessor: (row: AttendanceType) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${
          row.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Remarks',
      accessor: 'remarks' as keyof AttendanceType,
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={120} className="text-blue-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management Desk</h2>
          <p className="text-sm text-gray-500">Overview of operations and daily rosters logs.</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <CalendarDays size={20} className="text-blue-600" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Cards stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <DashboardCard title="Total Employees" value={totalEmployees} icon={Users} variant="blue" />
        <DashboardCard title="On Duty Today" value={presentToday} icon={UserCheck} variant="emerald" />
        <DashboardCard title="Absent / Off" value={absentToday} icon={UserMinus} variant="rose" />
        <DashboardCard title="Pending Leaves" value={pendingLeaveRequests} icon={FileClock} variant="amber" />
      </div>

      {/* Chart and Active checks splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Chart Roster */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={18} />
              <span>Operational Analytics</span>
            </h3>
            <p className="text-xs text-gray-400">Headcount roster metrics review.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0288D1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live checks logs */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="text-blue-600" size={18} />
              <span>Live Clock logs</span>
            </h3>
            <p className="text-xs text-gray-400">Recent check-in activities logged today.</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table
              columns={columns}
              data={recentAttendance || []}
              emptyTitle="No recent check-ins"
              emptyMessage="No employees have clocked in today yet."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

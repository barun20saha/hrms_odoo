import React, { useState } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { useAttendanceQueries } from '../../services/queries/useAttendanceQueries'
import { Table } from '../../components/Table'
import { Attendance as AttendanceType } from '../../types'

export const Attendance: React.FC = () => {
  const { useGetDailyRoster } = useAttendanceQueries()
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10))

  const { data: roster, isLoading } = useGetDailyRoster(date)

  const getStatusBadge = (status: string) => {
    const styles = {
      PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      HALF_DAY: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      ABSENT: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
      LEAVE: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    }

    const value = status as keyof typeof styles
    const styleClass = styles[value] || 'bg-gray-50 text-gray-700 border-gray-200'

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${styleClass}`}>
        {status}
      </span>
    )
  }

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId' as keyof AttendanceType,
    },
    {
      header: 'Work Date',
      accessor: 'date' as keyof AttendanceType,
    },
    {
      header: 'Check In',
      accessor: (row: AttendanceType) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      header: 'Check Out',
      accessor: (row: AttendanceType) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      header: 'Work Hours',
      accessor: (row: AttendanceType) => row.totalHours ? `${row.totalHours.toFixed(1)} hrs` : '-',
    },
    {
      header: 'Status',
      accessor: (row: AttendanceType) => getStatusBadge(row.status),
    },
    {
      header: 'Remarks',
      accessor: 'remarks' as keyof AttendanceType,
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Roster Tracking</h2>
            <p className="text-xs text-gray-400">Track and filter daily check-in logs for all employees.</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs shrink-0">
          <span className="text-xs font-semibold text-gray-500">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none text-sm text-gray-700 dark:text-white focus:outline-hidden focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={roster || []}
        isLoading={isLoading}
        emptyTitle="No records for this date"
        emptyMessage="No attendance logs have been recorded for this calendar day."
      />
    </div>
  )
}

export default Attendance

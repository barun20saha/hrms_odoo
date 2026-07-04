import React from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import { useAttendanceQueries } from '../../services/queries/useAttendanceQueries'
import { Table } from '../../components/Table'
import { Attendance as AttendanceType } from '../../types'

export const Attendance: React.FC = () => {
  const { useGetAttendanceHistory } = useAttendanceQueries()
  const { data: history, isLoading } = useGetAttendanceHistory()

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
        {status.replace('_', ' ')}
      </span>
    )
  }

  const columns = [
    {
      header: 'Work Date',
      accessor: (row: AttendanceType) => new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
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
      header: 'Remarks/Activity',
      accessor: 'remarks' as keyof AttendanceType,
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
          <CalendarDays size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attendance Logs</h2>
          <p className="text-xs text-gray-400">Review your past check-in and check-out logs.</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={history || []}
        isLoading={isLoading}
        emptyTitle="No attendance records"
        emptyMessage="You haven't recorded any check-in stamps yet."
      />
    </div>
  )
}

export default Attendance

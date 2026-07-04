import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { FileSpreadsheet, Loader2, Send, Calendar } from 'lucide-react'
import { useLeaveQueries } from '../../services/queries/useLeaveQueries'
import { Table } from '../../components/Table'
import { LeaveRequest as LeaveRequestType } from '../../types'

// Validation schema for leave application
const leaveFormSchema = zod.object({
  leaveType: zod.enum(['PAID', 'SICK', 'UNPAID']),
  startDate: zod.string().min(1, 'Start date is required'),
  endDate: zod.string().min(1, 'End date is required'),
  remarks: zod.string().max(250, 'Remarks cannot exceed 250 characters').optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

type LeaveFormInputs = zod.infer<typeof leaveFormSchema>

export const Leaves: React.FC = () => {
  const { useGetLeaveHistory, useApplyLeave } = useLeaveQueries()
  const { data: history, isLoading } = useGetLeaveHistory()
  const applyMutation = useApplyLeave()

  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveFormInputs>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: 'PAID',
    },
  })

  const onSubmit = async (data: LeaveFormInputs) => {
    setSubmitting(true)
    try {
      await applyMutation.mutateAsync({
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        remarks: data.remarks || '',
      })
      toast.success('Leave application submitted successfully!')
      reset()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit leave application')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      REJECTED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
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
      header: 'Leave Type',
      accessor: 'leaveType' as keyof LeaveRequestType,
    },
    {
      header: 'Start Date',
      accessor: (row: LeaveRequestType) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: 'End Date',
      accessor: (row: LeaveRequestType) => new Date(row.endDate).toLocaleDateString(),
    },
    {
      header: 'Remarks',
      accessor: 'remarks' as keyof LeaveRequestType,
    },
    {
      header: 'Status',
      accessor: (row: LeaveRequestType) => getStatusBadge(row.status),
    },
    {
      header: 'Admin Comments',
      accessor: 'adminComments' as keyof LeaveRequestType,
    },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Planner</h2>
          <p className="text-xs text-gray-400">Request vacation or sick leave and view your application logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Form: Apply Leave */}
        <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Apply for Leave</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Leave Type Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
              <select
                {...register('leaveType')}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="PAID">Annual Paid Leave</option>
                <option value="SICK">Sick/Medical Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                {...register('startDate')}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border ${
                  errors.startDate ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
                } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white`}
              />
              {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                {...register('endDate')}
                className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border ${
                  errors.endDate ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
                } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white`}
              />
              {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
            </div>

            {/* Remarks */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Remarks / Reason</label>
              <textarea
                rows={2}
                {...register('remarks')}
                placeholder="Reason for requesting time off..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              {errors.remarks && <p className="text-xs text-red-500">{errors.remarks.message}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Submit Request</span>
            </button>
          </form>
        </div>

        {/* Right Table: Leaves logs */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Application History</h3>
          <Table
            columns={columns}
            data={history || []}
            isLoading={isLoading}
            emptyTitle="No leave applications"
            emptyMessage="You haven't submitted any leave requests yet."
          />
        </div>
      </div>
    </div>
  )
}

export default Leaves

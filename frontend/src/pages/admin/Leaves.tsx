import React, { useState } from 'react'
import { FileSpreadsheet, Check, X, Loader2, MessageSquare } from 'lucide-react'
import { useLeaveQueries } from '../../services/queries/useLeaveQueries'
import { Table } from '../../components/Table'
import { LeaveRequest as LeaveRequestType } from '../../types'
import { toast } from 'react-hot-toast'

export const Leaves: React.FC = () => {
  const { useGetAllLeaves, useApproveLeave, useRejectLeave } = useLeaveQueries()
  const { data: leaves, isLoading } = useGetAllLeaves()
  
  const approveMutation = useApproveLeave()
  const rejectMutation = useRejectLeave()

  const [activeAction, setActiveAction] = useState<{
    requestId: string;
    type: 'approve' | 'reject';
  } | null>(null)

  const [comments, setComments] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleAction = async () => {
    if (!activeAction) return
    setProcessing(true)
    try {
      if (activeAction.type === 'approve') {
        await approveMutation.mutateAsync({
          requestId: activeAction.requestId,
          comments,
        })
        toast.success('Leave request approved!')
      } else {
        await rejectMutation.mutateAsync({
          requestId: activeAction.requestId,
          comments,
        })
        toast.success('Leave request rejected.')
      }
      setActiveAction(null)
      setComments('')
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to process leave action.')
    } finally {
      setProcessing(false)
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
      header: 'Employee ID',
      accessor: 'employeeId' as keyof LeaveRequestType,
    },
    {
      header: 'Category',
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
      header: 'Remarks/Reason',
      accessor: 'remarks' as keyof LeaveRequestType,
    },
    {
      header: 'Status',
      accessor: (row: LeaveRequestType) => getStatusBadge(row.status),
    },
    {
      header: 'Actions / Review',
      accessor: (row: LeaveRequestType) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' ? (
            <>
              <button
                onClick={() => setActiveAction({ requestId: row.id || '', type: 'approve' })}
                className="flex items-center gap-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Check size={12} />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setActiveAction({ requestId: row.id || '', type: 'reject' })}
                className="flex items-center gap-1 py-1 px-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <X size={12} />
                <span>Reject</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No actions pending</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leave Approvals</h2>
          <p className="text-xs text-gray-400">Process and review active employee leave applications.</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={leaves || []}
        isLoading={isLoading}
        emptyTitle="Queue is clear"
        emptyMessage="There are no active leave requests pending review."
      />

      {/* Review Remarks Modal */}
      {activeAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                Confirm {activeAction.type} Request
              </h3>
              <button
                onClick={() => {
                  setActiveAction(null)
                  setComments('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Leave Action Comments / Feedback (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-gray-400 pointer-events-none">
                  <MessageSquare size={16} />
                </span>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide review comments for the employee..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveAction(null)
                  setComments('')
                }}
                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-205 dark:bg-slate-850 dark:hover:bg-slate-800 text-gray-750 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing}
                className={`flex-1 flex justify-center items-center gap-2 py-2 px-4 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 ${
                  activeAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : null}
                <span className="capitalize">{activeAction.type}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaves

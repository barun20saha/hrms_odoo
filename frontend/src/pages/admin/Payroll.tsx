import React, { useState } from 'react'
import { CreditCard, CalendarDays, Edit3, Loader2, Sparkles, X, PlusCircle, CheckCircle2 } from 'lucide-react'
import { usePayrollQueries } from '../../services/queries/usePayrollQueries'
import { Table } from '../../components/Table'
import { Payroll as PayrollType } from '../../types'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'

// Validation Schemas
const generateSchema = zod.object({
  month: zod.number().min(1).max(12),
  year: zod.number().min(2000),
})

const structureSchema = zod.object({
  employeeId: zod.string().min(3, 'Employee ID is required'),
  basicSalary: zod.number().min(0, 'Basic salary must be positive'),
  allowances: zod.number().min(0, 'Allowances must be positive'),
  deductions: zod.number().min(0, 'Deductions must be positive'),
})

type GenerateFormInputs = zod.infer<typeof generateSchema>
type StructureFormInputs = zod.infer<typeof structureSchema>

export const Payroll: React.FC = () => {
  const {
    useGetAllPayroll,
    useUpdateSalaryStructure,
    useUpdatePayrollStatus,
    useGeneratePayroll,
  } = usePayrollQueries()

  const { data: slips, isLoading } = useGetAllPayroll()
  const structureMutation = useUpdateSalaryStructure()
  const statusMutation = useUpdatePayrollStatus()
  const generateMutation = useGeneratePayroll()

  const [showGenModal, setShowGenModal] = useState(false)
  const [showStructModal, setShowStructModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const {
    register: regGen,
    handleSubmit: handleGenSubmit,
    reset: resetGen,
    formState: { errors: genErrors },
  } = useForm<GenerateFormInputs>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  })

  const {
    register: regStruct,
    handleSubmit: handleStructSubmit,
    reset: resetStruct,
    formState: { errors: structErrors },
  } = useForm<StructureFormInputs>({
    resolver: zodResolver(structureSchema),
  })

  const onGenerate = async (data: GenerateFormInputs) => {
    setProcessing(true)
    try {
      const response = await generateMutation.mutateAsync(data)
      toast.success(response.message || 'Payroll generation completed!')
      setShowGenModal(false)
      resetGen()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setProcessing(false)
    }
  }

  const onUpdateStructure = async (data: StructureFormInputs) => {
    setProcessing(true)
    try {
      await structureMutation.mutateAsync({
        employeeId: data.employeeId,
        structure: {
          basicSalary: data.basicSalary,
          allowances: data.allowances,
          deductions: data.deductions,
        },
      })
      toast.success('Employee salary structure updated successfully!')
      setShowStructModal(false)
      resetStruct()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Update failed. Employee may not exist.')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async (payrollId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING'
    try {
      await statusMutation.mutateAsync({ payrollId, paymentStatus: nextStatus })
      toast.success(`Payroll status updated to ${nextStatus}!`)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to update payroll status.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
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
      header: 'Pay Period',
      accessor: (row: PayrollType) => `${monthNames[row.month]} ${row.year}`,
    },
    {
      header: 'Employee ID',
      accessor: 'employeeId' as keyof PayrollType,
    },
    {
      header: 'Net Salary',
      accessor: (row: PayrollType) => `$${row.netSalary.toLocaleString()}`,
    },
    {
      header: 'Status',
      accessor: (row: PayrollType) => getStatusBadge(row.paymentStatus),
    },
    {
      header: 'Release Stamp',
      accessor: (row: PayrollType) => row.paidDate ? new Date(row.paidDate).toLocaleDateString() : '-',
    },
    {
      header: 'Quick Action',
      accessor: (row: PayrollType) => (
        <button
          onClick={() => handleToggleStatus(row.id || '', row.paymentStatus)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-all py-1 px-2.5 rounded-lg border ${
            row.paymentStatus === 'PENDING'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-gray-300 dark:border-slate-700'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>{row.paymentStatus === 'PENDING' ? 'Mark Paid' : 'Revert Pending'}</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Actions Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payroll Management</h2>
            <p className="text-xs text-gray-400">Generate, adjust, and release employee salaries.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowStructModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-150 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-800 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all"
          >
            <Edit3 size={16} />
            <span>Salary Structures</span>
          </button>
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
          >
            <PlusCircle size={16} />
            <span>Batch Slips Generator</span>
          </button>
        </div>
      </div>

      {/* Salary Records Grid */}
      <Table
        columns={columns}
        data={slips || []}
        isLoading={isLoading}
        emptyTitle="No payroll records generated"
        emptyMessage="Generate slips for the current month to review details."
      />

      {/* 1. Batch Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Batch Slips Generator</h3>
              <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenSubmit(onGenerate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target Month</label>
                  <select
                    {...regGen('month', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {monthNames[i + 1]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target Year</label>
                  <input
                    type="number"
                    {...regGen('year', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-205 dark:bg-slate-850 text-gray-700 dark:text-gray-250 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  {processing ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Execute Generation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Update Structure Modal */}
      {showStructModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Adjust Salary Structure</h3>
              <button onClick={() => setShowStructModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleStructSubmit(onUpdateStructure)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Employee ID</label>
                <input
                  type="text"
                  {...regStruct('employeeId')}
                  placeholder="EMP1001"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
                {structErrors.employeeId && <p className="text-xs text-red-500">{structErrors.employeeId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Basic Salary ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...regStruct('basicSalary', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allowances ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...regStruct('allowances', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deductions ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...regStruct('deductions', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStructModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-205 dark:bg-slate-850 text-gray-700 dark:text-gray-250 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
                >
                  {processing ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Adjust Schema</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll

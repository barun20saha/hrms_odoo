import React, { useState } from 'react'
import { CreditCard, Eye, Printer, X, Download } from 'lucide-react'
import { usePayrollQueries } from '../../services/queries/usePayrollQueries'
import { Table } from '../../components/Table'
import { Payroll as PayrollType } from '../../types'
import { toast } from 'react-hot-toast'

export const Payroll: React.FC = () => {
  const { useGetOwnPayroll } = usePayrollQueries()
  const { data: slips, isLoading } = useGetOwnPayroll()

  const [selectedSlip, setSelectedSlip] = useState<PayrollType | null>(null)

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

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
      header: 'Basic Salary',
      accessor: (row: PayrollType) => `$${row.basicSalary.toLocaleString()}`,
    },
    {
      header: 'Allowances',
      accessor: (row: PayrollType) => `+$${row.allowances.toLocaleString()}`,
    },
    {
      header: 'Deductions',
      accessor: (row: PayrollType) => `-$${row.deductions.toLocaleString()}`,
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
      header: 'Action',
      accessor: (row: PayrollType) => (
        <button
          onClick={() => setSelectedSlip(row)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
        >
          <Eye size={14} />
          <span>View Slip</span>
        </button>
      ),
    },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast.success('Downloading payslip PDF receipt...')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
          <CreditCard size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salary Statements</h2>
          <p className="text-xs text-gray-400">View and print your monthly pay summaries and invoices.</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={slips || []}
        isLoading={isLoading}
        emptyTitle="No payroll slips"
        emptyMessage="No payslips have been generated for you yet."
      />

      {/* Payslip Receipt Modal Overlay */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 space-y-6 relative print:p-0 print:shadow-none print:border-none">
            {/* Modal header (hidden in print) */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 print:hidden">
              <h3 className="font-bold text-gray-800 dark:text-white">Pay Statement receipt</h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Print Body structure */}
            <div className="space-y-6 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">HRMS Corp</h4>
                  <p className="text-xs text-gray-400">123 Workplace Plaza, California</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">PAY SLIP RECORD</span>
                  <h5 className="font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {monthNames[selectedSlip.month]} {selectedSlip.year}
                  </h5>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                <div>
                  <span className="text-xs text-gray-450 uppercase block">Employee ID</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedSlip.employeeId}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-450 uppercase block">Payment Status</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedSlip.paymentStatus}</span>
                </div>
                {selectedSlip.generatedDate && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-455 uppercase block">Generated On</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(selectedSlip.generatedDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Balance Breakdown</span>
                <div className="divide-y divide-gray-100 dark:divide-slate-800/80 border-t border-b border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between py-2.5">
                    <span className="text-gray-500">Base Salary</span>
                    <span className="font-semibold">${selectedSlip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-gray-500">Allowances</span>
                    <span className="font-semibold text-green-600">+${selectedSlip.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <span className="text-gray-500">Deductions</span>
                    <span className="font-semibold text-red-500">-${selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 font-bold text-gray-900 dark:text-white">
                    <span>Net Credited Salary</span>
                    <span>${selectedSlip.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal actions (hidden in print) */}
            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm transition-all"
              >
                <Printer size={16} />
                <span>Print Slip</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll

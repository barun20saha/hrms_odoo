import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import {
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { useEmployeeQueries } from '../../services/queries/useEmployeeQueries'
import { Table } from '../../components/Table'
import { Employee } from '../../types'

// Onboarding validation schema
const employeeSchema = zod.object({
  employeeId: zod.string().min(3, 'Employee ID is required (e.g. EMP1001)'),
  firstName: zod.string().min(1, 'First name is required'),
  lastName: zod.string().min(1, 'Last name is required'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  phone: zod.string().optional(),
  address: zod.string().optional(),
  department: zod.string().min(1, 'Department is required'),
  designation: zod.string().min(1, 'Designation is required'),
  dateOfJoining: zod.string().min(1, 'Date of joining is required'),
  basicSalary: zod.number().min(0, 'Basic salary must be positive'),
  allowances: zod.number().min(0, 'Allowances must be positive'),
  deductions: zod.number().min(0, 'Deductions must be positive'),
})

type EmployeeFormInputs = zod.infer<typeof employeeSchema>

export const Employees: React.FC = () => {
  const {
    useGetEmployees,
    useCreateEmployee,
    useUpdateEmployee,
    useDeleteEmployee,
  } = useEmployeeQueries()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(10)

  const { data: empData, isLoading } = useGetEmployees(search, page, size)
  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const deleteMutation = useDeleteEmployee()

  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormInputs>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
    },
  })

  const openOnboardModal = () => {
    setEditingEmployee(null)
    reset({
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      department: '',
      designation: '',
      dateOfJoining: new Date().toISOString().substring(0, 10),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
    })
    setShowModal(true)
  }

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp)
    setValue('employeeId', emp.employeeId)
    setValue('firstName', emp.firstName)
    setValue('lastName', emp.lastName)
    setValue('email', emp.email)
    setValue('phone', emp.phone || '')
    setValue('address', emp.address || '')
    setValue('department', emp.department || '')
    setValue('designation', emp.designation || '')
    setValue('dateOfJoining', emp.dateOfJoining ? emp.dateOfJoining.substring(0, 10) : '')
    setValue('basicSalary', emp.salaryStructure?.basicSalary || 0)
    setValue('allowances', emp.salaryStructure?.allowances || 0)
    setValue('deductions', emp.salaryStructure?.deductions || 0)
    setShowModal(true)
  }

  const onSubmit = async (data: EmployeeFormInputs) => {
    try {
      const formattedData = {
        ...data,
        salaryStructure: {
          basicSalary: data.basicSalary,
          allowances: data.allowances,
          deductions: data.deductions,
        },
      }

      if (editingEmployee) {
        await updateMutation.mutateAsync({
          employeeId: editingEmployee.employeeId,
          data: formattedData,
        })
        toast.success('Employee updated successfully!')
      } else {
        await createMutation.mutateAsync(formattedData)
        toast.success('Employee onboarded successfully!')
      }
      setShowModal(false)
      reset()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const handleDelete = async (empId: string) => {
    try {
      await deleteMutation.mutateAsync(empId)
      toast.success('Employee deleted successfully!')
      setShowDeleteConfirm(null)
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to delete employee profile.')
    }
  }

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId' as keyof Employee,
    },
    {
      header: 'Full Name',
      accessor: (row: Employee) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email / Contact',
      accessor: 'email' as keyof Employee,
    },
    {
      header: 'Org Department',
      accessor: 'department' as keyof Employee,
    },
    {
      header: 'Role Designation',
      accessor: 'designation' as keyof Employee,
    },
    {
      header: 'Basic Salary',
      accessor: (row: Employee) => row.salaryStructure ? `$${row.salaryStructure.basicSalary.toLocaleString()}` : '-',
    },
    {
      header: 'Actions',
      accessor: (row: Employee) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(row.employeeId)}
            className="p-1 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Directory</h2>
            <p className="text-xs text-gray-400">View and manage employee profile records.</p>
          </div>
        </div>

        <button
          onClick={openOnboardModal}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all shrink-0"
        >
          <UserPlus size={18} />
          <span>Onboard Employee</span>
        </button>
      </div>

      {/* Searching filters */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 px-4 py-2.5 rounded-xl max-w-md shadow-xs">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0) // Reset to first page
          }}
          placeholder="Search by name, email, or department..."
          className="w-full bg-transparent border-none text-sm text-gray-700 dark:text-white focus:outline-hidden"
        />
      </div>

      {/* Employees Table Grid */}
      <Table
        columns={columns}
        data={empData?.content || []}
        isLoading={isLoading}
        emptyTitle="No employees found"
        emptyMessage="Try adjusting your search filters or onboard a new employee profile."
        currentPage={page + 1}
        totalPages={empData?.totalPages || 1}
        onPageChange={(p) => setPage(p - 1)}
      />

      {/* Onboard / Edit Employee Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {editingEmployee ? 'Edit Employee Details' : 'Onboard New Employee'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Employee ID</label>
                  <input
                    type="text"
                    {...register('employeeId')}
                    placeholder="EMP1001"
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 disabled:opacity-50 dark:text-white"
                  />
                  {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="name@company.com"
                    disabled={!!editingEmployee}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 disabled:opacity-50 dark:text-white"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">First Name</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    placeholder="John"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    placeholder="Doe"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Department</label>
                  <input
                    type="text"
                    {...register('department')}
                    placeholder="Engineering"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Designation</label>
                  <input
                    type="text"
                    {...register('designation')}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.designation && <p className="text-xs text-red-500">{errors.designation.message}</p>}
                </div>

                {/* Date of Joining */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Date of Joining</label>
                  <input
                    type="date"
                    {...register('dateOfJoining')}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.dateOfJoining && <p className="text-xs text-red-500">{errors.dateOfJoining.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="text"
                    {...register('phone')}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                </div>

                {/* Salary inputs */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Basic Salary ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('basicSalary', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                  {errors.basicSalary && <p className="text-xs text-red-500">{errors.basicSalary.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allowances ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('allowances', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deductions ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('deductions', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-250 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingEmployee ? 'Save Changes' : 'Onboard Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 p-6 space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white">Delete Employee Profile</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete employee <strong>{showDeleteConfirm}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees

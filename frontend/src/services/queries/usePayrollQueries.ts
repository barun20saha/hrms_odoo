import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Payroll } from '../../types'

export const usePayrollQueries = () => {
  const queryClient = useQueryClient()

  // 1. Get Logged-In User Salary Slips
  const useGetOwnPayroll = () => {
    return useQuery({
      queryKey: ['ownPayroll'],
      queryFn: async () => {
        const response = await api.get('/employee/payroll/my-salary')
        return response.data.data as Payroll[]
      },
    })
  }

  // 2. Get All Payroll Records (Admin)
  const useGetAllPayroll = () => {
    return useQuery({
      queryKey: ['adminPayroll'],
      queryFn: async () => {
        const response = await api.get('/admin/payroll/all')
        return response.data.data as Payroll[]
      },
    })
  }

  // 3. Update Employee Salary Structure (Admin)
  const useUpdateSalaryStructure = () => {
    return useMutation({
      mutationFn: async ({
        employeeId,
        structure,
      }: {
        employeeId: string;
        structure: { basicSalary?: number; allowances?: number; deductions?: number };
      }) => {
        const response = await api.put(`/admin/payroll/salary-structure/${employeeId}`, structure)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminPayroll'] })
        queryClient.invalidateQueries({ queryKey: ['employees'] })
      },
    })
  }

  // 4. Update individual Payslip Status (Admin, PAID/PENDING)
  const useUpdatePayrollStatus = () => {
    return useMutation({
      mutationFn: async ({ payrollId, paymentStatus }: { payrollId: string; paymentStatus: string }) => {
        const response = await api.put(`/admin/payroll/${payrollId}`, { paymentStatus })
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminPayroll'] })
        queryClient.invalidateQueries({ queryKey: ['ownPayroll'] })
      },
    })
  }

  // 5. Trigger Batch Generation (Admin, month & year)
  const useGeneratePayroll = () => {
    return useMutation({
      mutationFn: async (payload: { month: number; year: number }) => {
        const response = await api.post('/admin/payroll/generate', payload)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminPayroll'] })
      },
    })
  }

  return {
    useGetOwnPayroll,
    useGetAllPayroll,
    useUpdateSalaryStructure,
    useUpdatePayrollStatus,
    useGeneratePayroll,
  }
}
export default usePayrollQueries;

import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export const useDashboardQueries = () => {
  // 1. Employee Dashboard Queries
  const useGetEmployeeDashboard = () => {
    return useQuery({
      queryKey: ['employeeDashboard'],
      queryFn: async () => {
        const response = await api.get('/employee/dashboard')
        return response.data.data
      },
    })
  }

  // 2. Admin Dashboard Queries
  const useGetAdminDashboard = () => {
    return useQuery({
      queryKey: ['adminDashboard'],
      queryFn: async () => {
        const response = await api.get('/admin/dashboard')
        return response.data.data
      },
    })
  }

  return {
    useGetEmployeeDashboard,
    useGetAdminDashboard,
  }
}
export default useDashboardQueries;

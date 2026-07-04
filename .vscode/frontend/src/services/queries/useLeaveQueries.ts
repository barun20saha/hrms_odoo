import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { LeaveRequest } from '../../types'

export const useLeaveQueries = () => {
  const queryClient = useQueryClient()

  // 1. Get Personal Leave History
  const useGetLeaveHistory = () => {
    return useQuery({
      queryKey: ['leaveHistory'],
      queryFn: async () => {
        const response = await api.get('/employee/leaves/history')
        return response.data.data as LeaveRequest[]
      },
    })
  }

  // 2. Get All Leave Requests Queue (Admin)
  const useGetAllLeaves = () => {
    return useQuery({
      queryKey: ['adminLeaves'],
      queryFn: async () => {
        const response = await api.get('/admin/leaves/all')
        return response.data.data as LeaveRequest[]
      },
    })
  }

  // 3. Apply for Leave
  const useApplyLeave = () => {
    return useMutation({
      mutationFn: async (leaveData: { leaveType: string; startDate: string; endDate: string; remarks?: string }) => {
        const response = await api.post('/employee/leaves/apply', leaveData)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['leaveHistory'] })
        queryClient.invalidateQueries({ queryKey: ['adminLeaves'] })
        queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      },
    })
  }

  // 4. Approve Leave (Admin)
  const useApproveLeave = () => {
    return useMutation({
      mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
        const response = await api.post(`/admin/leaves/${requestId}/approve`, { comments })
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminLeaves'] })
        queryClient.invalidateQueries({ queryKey: ['leaveHistory'] })
        queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      },
    })
  }

  // 5. Reject Leave (Admin)
  const useRejectLeave = () => {
    return useMutation({
      mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
        const response = await api.post(`/admin/leaves/${requestId}/reject`, { comments })
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminLeaves'] })
        queryClient.invalidateQueries({ queryKey: ['leaveHistory'] })
        queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      },
    })
  }

  return {
    useGetLeaveHistory,
    useGetAllLeaves,
    useApplyLeave,
    useApproveLeave,
    useRejectLeave,
  }
}
export default useLeaveQueries;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Attendance } from '../../types'

export const useAttendanceQueries = () => {
  const queryClient = useQueryClient()

  // 1. Get Logged-In User Clock History
  const useGetAttendanceHistory = () => {
    return useQuery({
      queryKey: ['attendanceHistory'],
      queryFn: async () => {
        const response = await api.get('/employee/attendance/history')
        return response.data.data as Attendance[]
      },
    })
  }

  // 2. Get Daily Attendance Roster (Admin only, date parameter)
  const useGetDailyRoster = (dateString: string) => {
    return useQuery({
      queryKey: ['dailyRoster', dateString],
      queryFn: async () => {
        const response = await api.get(`/admin/attendance/daily?date=${dateString}`)
        return response.data.data as Attendance[]
      },
      enabled: !!dateString,
    })
  }

  // 3. Trigger check-in
  const useCheckIn = () => {
    return useMutation({
      mutationFn: async (remarks?: string) => {
        const response = await api.post('/employee/attendance/check-in', null, {
          params: remarks ? { remarks } : {},
        })
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attendanceHistory'] })
        queryClient.invalidateQueries({ queryKey: ['dailyRoster'] })
        queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      },
    })
  }

  // 4. Trigger check-out
  const useCheckOut = () => {
    return useMutation({
      mutationFn: async () => {
        const response = await api.post('/employee/attendance/check-out')
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['attendanceHistory'] })
        queryClient.invalidateQueries({ queryKey: ['dailyRoster'] })
        queryClient.invalidateQueries({ queryKey: ['employeeDashboard'] })
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      },
    })
  }

  return {
    useGetAttendanceHistory,
    useGetDailyRoster,
    useCheckIn,
    useCheckOut,
  }
}
export default useAttendanceQueries;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Employee } from '../../types'

export const useEmployeeQueries = () => {
  const queryClient = useQueryClient()

  // 1. Get Logged-In User Profile
  const useGetProfile = () => {
    return useQuery({
      queryKey: ['employeeProfile'],
      queryFn: async () => {
        const response = await api.get('/employee/profile')
        return response.data.data as Employee
      },
    })
  }

  // 2. Get All Employees List (Admin, supporting search & page parameters)
  const useGetEmployees = (search: string = '', page: number = 0, size: number = 10) => {
    return useQuery({
      queryKey: ['employees', search, page, size],
      queryFn: async () => {
        const response = await api.get('/admin/employees', {
          params: { search, page, size },
        })
        // Backend returns ApiResponse<PageResponse<EmployeeResponse>>
        // PageResponse contains: content: List, currentPage: int, totalPages: int, totalElements: long
        return response.data.data as {
          content: Employee[];
          currentPage: number;
          totalPages: number;
          totalElements: number;
        }
      },
    })
  }

  // 3. Create/Onboard Employee (Admin)
  const useCreateEmployee = () => {
    return useMutation({
      mutationFn: async (employee: Omit<Employee, 'id'>) => {
        const response = await api.post('/admin/employees', employee)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] })
      },
    })
  }

  // 4. Update Employee Profile Details (Admin)
  const useUpdateEmployee = () => {
    return useMutation({
      mutationFn: async ({ employeeId, data }: { employeeId: string; data: Partial<Employee> }) => {
        const response = await api.put(`/admin/employees/${employeeId}`, data)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] })
        queryClient.invalidateQueries({ queryKey: ['employeeProfile'] })
      },
    })
  }

  // 5. Update personal Phone Number (Employee/Admin)
  const useUpdateProfilePhone = () => {
    return useMutation({
      mutationFn: async (phone: string) => {
        const response = await api.put(`/employee/profile/phone?phone=${encodeURIComponent(phone)}`)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employeeProfile'] })
      },
    })
  }

  // 6. Update personal Address (Employee/Admin)
  const useUpdateProfileAddress = () => {
    return useMutation({
      mutationFn: async (address: string) => {
        const response = await api.put(`/employee/profile/address?address=${encodeURIComponent(address)}`)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employeeProfile'] })
      },
    })
  }

  // 7. Update Profile Picture URL (Employee/Admin)
  const useUpdateProfilePicture = () => {
    return useMutation({
      mutationFn: async (url: string) => {
        const response = await api.post(`/employee/profile/picture?url=${encodeURIComponent(url)}`)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employeeProfile'] })
      },
    })
  }

  // 8. Delete Employee Profile (Admin)
  const useDeleteEmployee = () => {
    return useMutation({
      mutationFn: async (employeeId: string) => {
        const response = await api.delete(`/admin/employees/${employeeId}`)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] })
      },
    })
  }

  return {
    useGetProfile,
    useGetEmployees,
    useCreateEmployee,
    useUpdateEmployee,
    useUpdateProfilePhone,
    useUpdateProfileAddress,
    useUpdateProfilePicture,
    useDeleteEmployee,
  }
}
export default useEmployeeQueries;

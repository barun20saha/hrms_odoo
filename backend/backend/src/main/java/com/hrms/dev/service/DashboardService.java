package com.hrms.dev.service;

import com.hrms.dev.dto.AdminDashboardResponse;
import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.EmployeeDashboardResponse;

public interface DashboardService {
    ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(String email);
    ApiResponse<AdminDashboardResponse> getAdminDashboard();
}

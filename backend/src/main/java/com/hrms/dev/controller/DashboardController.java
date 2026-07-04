package com.hrms.dev.controller;

import com.hrms.dev.dto.AdminDashboardResponse;
import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.EmployeeDashboardResponse;
import com.hrms.dev.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dashboard", description = "Endpoints for employee and admin dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/employee/dashboard")
    @Operation(summary = "Retrieve logged-in employee dashboard data (Employee/Admin)")
    public ResponseEntity<ApiResponse<EmployeeDashboardResponse>> getEmployeeDashboard(Authentication authentication) {
        ApiResponse<EmployeeDashboardResponse> response = dashboardService.getEmployeeDashboard(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/dashboard")
    @Operation(summary = "Retrieve administrative dashboard statistics (Admin only)")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        ApiResponse<AdminDashboardResponse> response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(response);
    }
}

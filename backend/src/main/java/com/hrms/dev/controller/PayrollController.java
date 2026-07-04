package com.hrms.dev.controller;

import com.hrms.dev.dto.*;
import com.hrms.dev.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Payroll Management", description = "Endpoints for employee salary statements and admin payroll processing")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // --- EMPLOYEE ENDPOINTS ---

    @GetMapping("/employee/payroll/my-salary")
    @Operation(summary = "View logged-in employee salary statement/slips (Employee/Admin)")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getOwnSalaryHistory(Authentication authentication) {
        ApiResponse<List<PayrollResponse>> response = payrollService.getOwnSalaryHistory(authentication.getName());
        return ResponseEntity.ok(response);
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/payroll/all")
    @Operation(summary = "View all payroll records (Admin only)")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getAllPayroll() {
        ApiResponse<List<PayrollResponse>> response = payrollService.getAllPayroll();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/payroll/salary-structure/{employeeId}")
    @Operation(summary = "Update an employee's salary structure (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateSalaryStructure(
            @PathVariable String employeeId,
            @Valid @RequestBody SalaryStructureUpdateRequest request) {
        ApiResponse<EmployeeResponse> response = payrollService.updateSalaryStructure(employeeId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/payroll/{payrollId}")
    @Operation(summary = "Update status of a payroll slip (Admin only)")
    public ResponseEntity<ApiResponse<PayrollResponse>> updatePayroll(
            @PathVariable String payrollId,
            @Valid @RequestBody PayrollUpdateRequest request) {
        ApiResponse<PayrollResponse> response = payrollService.updatePayroll(payrollId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/payroll/generate")
    @Operation(summary = "Batch generate payroll slips for all active employees for a month/year (Admin only)")
    public ResponseEntity<ApiResponse<String>> generatePayroll(@Valid @RequestBody PayrollGenerateRequest request) {
        ApiResponse<String> response = payrollService.generatePayroll(request.getMonth(), request.getYear());
        return ResponseEntity.ok(response);
    }
}

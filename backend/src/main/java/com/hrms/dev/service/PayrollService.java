package com.hrms.dev.service;

import com.hrms.dev.dto.*;

import java.util.List;

public interface PayrollService {
    ApiResponse<List<PayrollResponse>> getOwnSalaryHistory(String email);
    
    // Admin operations
    ApiResponse<List<PayrollResponse>> getAllPayroll();
    ApiResponse<EmployeeResponse> updateSalaryStructure(String employeeId, SalaryStructureUpdateRequest request);
    ApiResponse<PayrollResponse> updatePayroll(String payrollId, PayrollUpdateRequest request);
    ApiResponse<String> generatePayroll(Integer month, Integer year);
}

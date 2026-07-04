package com.hrms.dev.service;

import com.hrms.dev.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface EmployeeService {
    // Admin operations
    ApiResponse<EmployeeResponse> createEmployee(EmployeeCreateRequest request);
    ApiResponse<EmployeeResponse> updateEmployee(String employeeId, EmployeeUpdateRequest request);
    ApiResponse<String> deleteEmployee(String employeeId);
    ApiResponse<EmployeeResponse> getEmployeeById(String employeeId);
    ApiResponse<Page<EmployeeResponse>> getAllEmployees(int page, int size, String search);

    // Employee operations
    ApiResponse<EmployeeResponse> getOwnProfile(String email);
    ApiResponse<EmployeeResponse> updateOwnPhone(String email, String phone);
    ApiResponse<EmployeeResponse> updateOwnAddress(String email, String address);
    ApiResponse<EmployeeResponse> updateOwnProfilePicture(String email, String profilePictureUrl);
}

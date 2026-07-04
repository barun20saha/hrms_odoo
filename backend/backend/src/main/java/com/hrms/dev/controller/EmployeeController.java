package com.hrms.dev.controller;

import com.hrms.dev.dto.*;
import com.hrms.dev.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Employee Management", description = "Endpoints for employee self-profile management and admin employee records CRUD")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // --- EMPLOYEE PROFILE ENDPOINTS ---

    @GetMapping("/employee/profile")
    @Operation(summary = "View logged-in employee profile (Employee/Admin)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getOwnProfile(Authentication authentication) {
        ApiResponse<EmployeeResponse> response = employeeService.getOwnProfile(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/employee/profile/phone")
    @Operation(summary = "Update logged-in employee phone number")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateOwnPhone(Authentication authentication, @RequestParam String phone) {
        ApiResponse<EmployeeResponse> response = employeeService.updateOwnPhone(authentication.getName(), phone);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/employee/profile/address")
    @Operation(summary = "Update logged-in employee address")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateOwnAddress(Authentication authentication, @RequestParam String address) {
        ApiResponse<EmployeeResponse> response = employeeService.updateOwnAddress(authentication.getName(), address);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/employee/profile/picture")
    @Operation(summary = "Update logged-in employee profile picture URL")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateOwnProfilePicture(Authentication authentication, @RequestParam String url) {
        ApiResponse<EmployeeResponse> response = employeeService.updateOwnProfilePicture(authentication.getName(), url);
        return ResponseEntity.ok(response);
    }

    // --- ADMIN CRUD ENDPOINTS ---

    @PostMapping("/admin/employees")
    @Operation(summary = "Onboard/Create a new employee profile (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        ApiResponse<EmployeeResponse> response = employeeService.createEmployee(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/employees/{employeeId}")
    @Operation(summary = "Update employee details (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable String employeeId,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        ApiResponse<EmployeeResponse> response = employeeService.updateEmployee(employeeId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/employees/{employeeId}")
    @Operation(summary = "Delete employee profile and associated user credentials (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(@PathVariable String employeeId) {
        ApiResponse<String> response = employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/employees/{employeeId}")
    @Operation(summary = "View details of an employee by employee ID (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable String employeeId) {
        ApiResponse<EmployeeResponse> response = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/employees")
    @Operation(summary = "Retrieve a list of all employees with pagination, sorting, and regex search (Admin only)")
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        ApiResponse<Page<EmployeeResponse>> response = employeeService.getAllEmployees(page, size, search);
        return ResponseEntity.ok(response);
    }
}

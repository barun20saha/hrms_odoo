package com.hrms.dev.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.Instant;

@Data
public class EmployeeCreateRequest {
    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String phone;
    private String address;
    private String department;
    private String designation;
    
    @NotNull(message = "Date of joining is required")
    private Instant dateOfJoining;

    @PositiveOrZero(message = "Basic salary must be positive or zero")
    private Double basicSalary;

    @PositiveOrZero(message = "Allowances must be positive or zero")
    private Double allowances;

    @PositiveOrZero(message = "Deductions must be positive or zero")
    private Double deductions;
}

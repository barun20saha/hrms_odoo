package com.hrms.dev.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class EmployeeUpdateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;
    private String address;
    private String department;
    private String designation;

    @PositiveOrZero(message = "Basic salary must be positive or zero")
    private Double basicSalary;

    @PositiveOrZero(message = "Allowances must be positive or zero")
    private Double allowances;

    @PositiveOrZero(message = "Deductions must be positive or zero")
    private Double deductions;
}

package com.hrms.dev.dto;

import com.hrms.dev.entity.Employee.SalaryStructure;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private String id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String profilePictureUrl;
    private String department;
    private String designation;
    private Instant dateOfJoining;
    private SalaryStructure salaryStructure;
    private Instant createdAt;
    private Instant updatedAt;
}

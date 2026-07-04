package com.hrms.dev.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class SalaryStructureUpdateRequest {
    @PositiveOrZero(message = "Basic salary must be positive or zero")
    private Double basicSalary;

    @PositiveOrZero(message = "Allowances must be positive or zero")
    private Double allowances;

    @PositiveOrZero(message = "Deductions must be positive or zero")
    private Double deductions;
}

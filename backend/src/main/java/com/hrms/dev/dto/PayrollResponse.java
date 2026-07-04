package com.hrms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    private String id;
    private String employeeId;
    private Integer month;
    private Integer year;
    private Double basicSalary;
    private Double allowances;
    private Double deductions;
    private Double netSalary;
    private String paymentStatus;
    private Instant generatedDate;
    private Instant paidDate;
}

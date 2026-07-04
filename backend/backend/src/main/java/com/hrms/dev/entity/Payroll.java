package com.hrms.dev.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payroll")
@CompoundIndex(name = "emp_month_year_idx", def = "{'employeeId': 1, 'month': 1, 'year': 1}", unique = true)
public class Payroll {
    @Id
    private String id;

    @Indexed
    private String employeeId;

    private Integer month;
    private Integer year;

    private Double basicSalary;
    private Double allowances;
    private Double deductions;
    private Double netSalary;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private Instant generatedDate;
    private Instant paidDate;

    public enum PaymentStatus {
        PAID, PENDING
    }
}

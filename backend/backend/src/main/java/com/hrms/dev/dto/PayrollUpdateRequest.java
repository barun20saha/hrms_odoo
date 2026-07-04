package com.hrms.dev.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayrollUpdateRequest {
    @NotBlank(message = "Payment status is required")
    private String paymentStatus; // PAID, PENDING
}

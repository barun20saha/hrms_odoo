package com.hrms.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private String id;
    private String employeeId;
    private LocalDate date;
    private Instant checkIn;
    private Instant checkOut;
    private String status;
    private Double totalHours;
    private String remarks;
}

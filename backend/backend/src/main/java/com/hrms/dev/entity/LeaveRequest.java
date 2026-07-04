package com.hrms.dev.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leave_requests")
public class LeaveRequest {
    @Id
    private String id;

    @Indexed
    private String employeeId;

    private LeaveType leaveType;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Builder.Default
    private Status status = Status.PENDING;
    
    private String remarks;
    private String adminComments;
    
    private Instant appliedDate;

    public enum LeaveType {
        PAID, SICK, UNPAID
    }

    public enum Status {
        PENDING, APPROVED, REJECTED
    }
}

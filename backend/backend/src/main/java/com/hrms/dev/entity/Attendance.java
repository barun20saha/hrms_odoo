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
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
@CompoundIndex(name = "emp_date_idx", def = "{'employeeId': 1, 'date': 1}", unique = true)
public class Attendance {
    @Id
    private String id;

    @Indexed
    private String employeeId;

    private LocalDate date;
    
    private Instant checkIn;
    private Instant checkOut;
    
    private Status status;
    
    private Double totalHours;
    private String remarks;

    public enum Status {
        PRESENT, ABSENT, HALF_DAY, LEAVE
    }
}

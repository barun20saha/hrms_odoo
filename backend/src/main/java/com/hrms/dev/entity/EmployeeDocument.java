package com.hrms.dev.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "documents")
public class EmployeeDocument {
    @Id
    private String id;

    @Indexed
    private String employeeId;

    private String documentType;
    private String documentName;
    private String documentUrl;
    private Instant uploadedDate;
}

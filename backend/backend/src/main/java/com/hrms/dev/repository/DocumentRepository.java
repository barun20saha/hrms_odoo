package com.hrms.dev.repository;

import com.hrms.dev.entity.EmployeeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends MongoRepository<EmployeeDocument, String> {
    List<EmployeeDocument> findByEmployeeId(String employeeId);
    void deleteByEmployeeId(String employeeId);
}

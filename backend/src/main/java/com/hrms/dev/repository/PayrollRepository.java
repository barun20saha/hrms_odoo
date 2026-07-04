package com.hrms.dev.repository;

import com.hrms.dev.entity.Payroll;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends MongoRepository<Payroll, String> {
    List<Payroll> findByEmployeeId(String employeeId);
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(String employeeId, Integer month, Integer year);
}

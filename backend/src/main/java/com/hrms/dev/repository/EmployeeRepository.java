package com.hrms.dev.repository;

import com.hrms.dev.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmail(String email);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmail(String email);

    @Query("{ '$or': [ " +
           "  { 'employeeId': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'firstName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'lastName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'department': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'designation': { '$regex': ?0, '$options': 'i' } } " +
           "] }")
    Page<Employee> searchEmployees(String keyword, Pageable pageable);
}

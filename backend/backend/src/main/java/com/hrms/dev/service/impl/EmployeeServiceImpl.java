package com.hrms.dev.service.impl;

import com.hrms.dev.dto.*;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.Employee.SalaryStructure;
import com.hrms.dev.entity.User;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.DocumentRepository;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.UserRepository;
import com.hrms.dev.service.EmployeeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Override
    @Transactional
    public ApiResponse<EmployeeResponse> createEmployee(EmployeeCreateRequest request) {
        if (employeeRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new BadRequestException("Employee ID already exists");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        SalaryStructure salary = SalaryStructure.builder()
                .basicSalary(request.getBasicSalary() != null ? request.getBasicSalary() : 0.0)
                .allowances(request.getAllowances() != null ? request.getAllowances() : 0.0)
                .deductions(request.getDeductions() != null ? request.getDeductions() : 0.0)
                .build();

        Employee employee = Employee.builder()
                .employeeId(request.getEmployeeId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .dateOfJoining(request.getDateOfJoining())
                .salaryStructure(salary)
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Employee profile created for employee ID: {}", saved.getEmployeeId());

        return ApiResponse.success("Employee onboarding successful", entityMapper.toEmployeeResponse(saved));
    }

    @Override
    public ApiResponse<EmployeeResponse> updateEmployee(String employeeId, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        employee.setAddress(request.getAddress());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());

        SalaryStructure salary = employee.getSalaryStructure();
        if (salary == null) {
            salary = new SalaryStructure();
        }
        if (request.getBasicSalary() != null) salary.setBasicSalary(request.getBasicSalary());
        if (request.getAllowances() != null) salary.setAllowances(request.getAllowances());
        if (request.getDeductions() != null) salary.setDeductions(request.getDeductions());
        employee.setSalaryStructure(salary);

        Employee updated = employeeRepository.save(employee);
        log.info("Employee profile updated for employee ID: {}", employeeId);

        return ApiResponse.success("Employee updated successfully", entityMapper.toEmployeeResponse(updated));
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteEmployee(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        employeeRepository.delete(employee);
        
        // Remove credentials (User)
        userRepository.findByEmployeeId(employeeId).ifPresent(user -> userRepository.delete(user));
        
        // Remove documents
        documentRepository.deleteByEmployeeId(employeeId);

        log.info("Deleted employee profile and credentials for employee ID: {}", employeeId);
        return ApiResponse.success("Employee deleted successfully");
    }

    @Override
    public ApiResponse<EmployeeResponse> getEmployeeById(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        return ApiResponse.success("Employee retrieved successfully", entityMapper.toEmployeeResponse(employee));
    }

    @Override
    public ApiResponse<Page<EmployeeResponse>> getAllEmployees(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("employeeId").ascending());
        Page<Employee> employeePage;

        if (search != null && !search.trim().isEmpty()) {
            employeePage = employeeRepository.searchEmployees(search.trim(), pageable);
        } else {
            employeePage = employeeRepository.findAll(pageable);
        }

        Page<EmployeeResponse> responsePage = employeePage.map(entityMapper::toEmployeeResponse);
        return ApiResponse.success("Employees list retrieved", responsePage);
    }

    @Override
    public ApiResponse<EmployeeResponse> getOwnProfile(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for email: " + email));
        return ApiResponse.success("Profile retrieved successfully", entityMapper.toEmployeeResponse(employee));
    }

    @Override
    public ApiResponse<EmployeeResponse> updateOwnPhone(String email, String phone) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for email: " + email));
        employee.setPhone(phone);
        Employee updated = employeeRepository.save(employee);
        return ApiResponse.success("Phone number updated successfully", entityMapper.toEmployeeResponse(updated));
    }

    @Override
    public ApiResponse<EmployeeResponse> updateOwnAddress(String email, String address) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for email: " + email));
        employee.setAddress(address);
        Employee updated = employeeRepository.save(employee);
        return ApiResponse.success("Address updated successfully", entityMapper.toEmployeeResponse(updated));
    }

    @Override
    public ApiResponse<EmployeeResponse> updateOwnProfilePicture(String email, String profilePictureUrl) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for email: " + email));
        employee.setProfilePictureUrl(profilePictureUrl);
        Employee updated = employeeRepository.save(employee);
        return ApiResponse.success("Profile picture updated successfully", entityMapper.toEmployeeResponse(updated));
    }
}

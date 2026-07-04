package com.hrms.dev.service.impl;

import com.hrms.dev.dto.*;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.Employee.SalaryStructure;
import com.hrms.dev.entity.Payroll;
import com.hrms.dev.entity.Payroll.PaymentStatus;
import com.hrms.dev.exception.BadRequestException;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.PayrollRepository;
import com.hrms.dev.service.PayrollService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PayrollServiceImpl implements PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Override
    public ApiResponse<List<PayrollResponse>> getOwnSalaryHistory(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        List<Payroll> payrollList = payrollRepository.findByEmployeeId(employee.getEmployeeId());
        List<PayrollResponse> responses = payrollList.stream()
                .map(entityMapper::toPayrollResponse)
                .collect(Collectors.toList());

        return ApiResponse.success("Salary history retrieved successfully", responses);
    }

    @Override
    public ApiResponse<List<PayrollResponse>> getAllPayroll() {
        List<Payroll> payrollList = payrollRepository.findAll();
        List<PayrollResponse> responses = payrollList.stream()
                .map(entityMapper::toPayrollResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("All payroll records retrieved", responses);
    }

    @Override
    public ApiResponse<EmployeeResponse> updateSalaryStructure(String employeeId, SalaryStructureUpdateRequest request) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for ID: " + employeeId));

        SalaryStructure structure = employee.getSalaryStructure();
        if (structure == null) {
            structure = new SalaryStructure();
        }
        if (request.getBasicSalary() != null) structure.setBasicSalary(request.getBasicSalary());
        if (request.getAllowances() != null) structure.setAllowances(request.getAllowances());
        if (request.getDeductions() != null) structure.setDeductions(request.getDeductions());
        employee.setSalaryStructure(structure);

        Employee saved = employeeRepository.save(employee);
        log.info("Salary structure updated for employee: {}", employeeId);

        return ApiResponse.success("Salary structure updated successfully", entityMapper.toEmployeeResponse(saved));
    }

    @Override
    public ApiResponse<PayrollResponse> updatePayroll(String payrollId, PayrollUpdateRequest request) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + payrollId));

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(request.getPaymentStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment status. Supported statuses: PAID, PENDING");
        }

        payroll.setPaymentStatus(status);
        if (status == PaymentStatus.PAID) {
            payroll.setPaidDate(Instant.now());
        } else {
            payroll.setPaidDate(null);
        }

        Payroll saved = payrollRepository.save(payroll);
        log.info("Payroll status updated to {} for payroll record ID: {}", status, payrollId);

        return ApiResponse.success("Payroll record updated successfully", entityMapper.toPayrollResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<String> generatePayroll(Integer month, Integer year) {
        List<Employee> employees = employeeRepository.findAll();
        int generatedCount = 0;
        int skippedCount = 0;

        for (Employee employee : employees) {
            Optional<Payroll> existing = payrollRepository.findByEmployeeIdAndMonthAndYear(
                    employee.getEmployeeId(), month, year);

            if (existing.isPresent()) {
                skippedCount++;
                continue;
            }

            SalaryStructure salary = employee.getSalaryStructure();
            double basic = salary != null && salary.getBasicSalary() != null ? salary.getBasicSalary() : 0.0;
            double allowances = salary != null && salary.getAllowances() != null ? salary.getAllowances() : 0.0;
            double deductions = salary != null && salary.getDeductions() != null ? salary.getDeductions() : 0.0;
            double net = basic + allowances - deductions;

            Payroll payroll = Payroll.builder()
                    .employeeId(employee.getEmployeeId())
                    .month(month)
                    .year(year)
                    .basicSalary(basic)
                    .allowances(allowances)
                    .deductions(deductions)
                    .netSalary(net)
                    .paymentStatus(PaymentStatus.PENDING)
                    .generatedDate(Instant.now())
                    .build();

            payrollRepository.save(payroll);
            generatedCount++;
        }

        log.info("Payroll generation completed for month {}/{}. Generated: {}, Skipped: {}", 
                month, year, generatedCount, skippedCount);

        return ApiResponse.success("Payroll generation process completed. Slips generated: " 
                + generatedCount + ", skipped: " + skippedCount);
    }
}

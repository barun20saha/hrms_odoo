package com.hrms.dev.mapper;

import com.hrms.dev.dto.AttendanceResponse;
import com.hrms.dev.dto.EmployeeResponse;
import com.hrms.dev.dto.LeaveResponse;
import com.hrms.dev.dto.PayrollResponse;
import com.hrms.dev.entity.Attendance;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.LeaveRequest;
import com.hrms.dev.entity.Payroll;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public EmployeeResponse toEmployeeResponse(Employee employee) {
        if (employee == null) {
            return null;
        }

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .address(employee.getAddress())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .dateOfJoining(employee.getDateOfJoining())
                .salaryStructure(employee.getSalaryStructure())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    public AttendanceResponse toAttendanceResponse(Attendance attendance) {
        if (attendance == null) {
            return null;
        }

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployeeId())
                .date(attendance.getDate())
                .checkIn(attendance.getCheckIn())
                .checkOut(attendance.getCheckOut())
                .status(attendance.getStatus() != null ? attendance.getStatus().name() : null)
                .totalHours(attendance.getTotalHours())
                .remarks(attendance.getRemarks())
                .build();
    }

    public LeaveResponse toLeaveResponse(LeaveRequest leaveRequest) {
        if (leaveRequest == null) {
            return null;
        }

        return LeaveResponse.builder()
                .id(leaveRequest.getId())
                .employeeId(leaveRequest.getEmployeeId())
                .leaveType(leaveRequest.getLeaveType() != null ? leaveRequest.getLeaveType().name() : null)
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .status(leaveRequest.getStatus() != null ? leaveRequest.getStatus().name() : null)
                .remarks(leaveRequest.getRemarks())
                .adminComments(leaveRequest.getAdminComments())
                .appliedDate(leaveRequest.getAppliedDate())
                .build();
    }

    public PayrollResponse toPayrollResponse(Payroll payroll) {
        if (payroll == null) {
            return null;
        }

        return PayrollResponse.builder()
                .id(payroll.getId())
                .employeeId(payroll.getEmployeeId())
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .basicSalary(payroll.getBasicSalary())
                .allowances(payroll.getAllowances())
                .deductions(payroll.getDeductions())
                .netSalary(payroll.getNetSalary())
                .paymentStatus(payroll.getPaymentStatus() != null ? payroll.getPaymentStatus().name() : null)
                .generatedDate(payroll.getGeneratedDate())
                .paidDate(payroll.getPaidDate())
                .build();
    }
}

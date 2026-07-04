package com.hrms.dev.service.impl;

import com.hrms.dev.dto.AdminDashboardResponse;
import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.AttendanceResponse;
import com.hrms.dev.dto.EmployeeDashboardResponse;
import com.hrms.dev.dto.EmployeeDashboardResponse.*;
import com.hrms.dev.entity.Attendance;
import com.hrms.dev.entity.Employee;
import com.hrms.dev.entity.LeaveRequest;
import com.hrms.dev.exception.ResourceNotFoundException;
import com.hrms.dev.mapper.EntityMapper;
import com.hrms.dev.repository.AttendanceRepository;
import com.hrms.dev.repository.EmployeeRepository;
import com.hrms.dev.repository.LeaveRequestRepository;
import com.hrms.dev.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EntityMapper entityMapper;

    @Override
    public ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for email: " + email));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        // Attendance stats this month
        List<Attendance> attendanceList = attendanceRepository.findByEmployeeIdAndDateBetween(
                employee.getEmployeeId(), startOfMonth, endOfMonth);

        long presents = 0, absents = 0, halfDays = 0, leaves = 0;
        for (Attendance att : attendanceList) {
            switch (att.getStatus()) {
                case PRESENT -> presents++;
                case ABSENT -> absents++;
                case HALF_DAY -> halfDays++;
                case LEAVE -> leaves++;
            }
        }

        // Leave stats history
        List<LeaveRequest> leaveList = leaveRequestRepository.findByEmployeeId(employee.getEmployeeId());
        long approvedLeaves = 0, pendingLeaves = 0, rejectedLeaves = 0;
        for (LeaveRequest lr : leaveList) {
            switch (lr.getStatus()) {
                case APPROVED -> approvedLeaves++;
                case PENDING -> pendingLeaves++;
                case REJECTED -> rejectedLeaves++;
            }
        }

        // Create responses DTO
        ProfileSummary profileSummary = ProfileSummary.builder()
                .employeeId(employee.getEmployeeId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .profilePictureUrl(employee.getProfilePictureUrl())
                .build();

        AttendanceSummary attendanceSummary = AttendanceSummary.builder()
                .presents(presents)
                .absents(absents)
                .halfDays(halfDays)
                .leaves(leaves)
                .build();

        LeaveSummary leaveSummary = LeaveSummary.builder()
                .approved(approvedLeaves)
                .pending(pendingLeaves)
                .rejected(rejectedLeaves)
                .build();

        // Notifications mock
        List<NotificationItem> notifications = new ArrayList<>();
        notifications.add(NotificationItem.builder()
                .id("1")
                .message("Welcome to the new HRMS system! Build completed.")
                .dateString(today.toString())
                .build());
        notifications.add(NotificationItem.builder()
                .id("2")
                .message("Please update your phone and address details if there are any changes.")
                .dateString(today.minusDays(1).toString())
                .build());

        EmployeeDashboardResponse response = EmployeeDashboardResponse.builder()
                .profileSummary(profileSummary)
                .attendanceSummary(attendanceSummary)
                .leaveSummary(leaveSummary)
                .notifications(notifications)
                .build();

        return ApiResponse.success("Employee dashboard retrieved successfully", response);
    }

    @Override
    public ApiResponse<AdminDashboardResponse> getAdminDashboard() {
        long totalEmployees = employeeRepository.count();
        LocalDate today = LocalDate.now();

        // Query today's attendance
        List<Attendance> todayRecords = attendanceRepository.findByDate(today);
        long presentsToday = 0;
        for (Attendance att : todayRecords) {
            if (att.getStatus() == Attendance.Status.PRESENT || att.getStatus() == Attendance.Status.HALF_DAY) {
                presentsToday++;
            }
        }
        long absentsToday = Math.max(0, totalEmployees - presentsToday);

        // Pending leaves count
        long pendingLeaves = leaveRequestRepository.findByStatus(LeaveRequest.Status.PENDING).size();

        // Recent attendance today (max 10)
        List<AttendanceResponse> recentAttendance = todayRecords.stream()
                .limit(10)
                .map(entityMapper::toAttendanceResponse)
                .collect(Collectors.toList());

        AdminDashboardResponse response = AdminDashboardResponse.builder()
                .totalEmployees(totalEmployees)
                .presentToday(presentsToday)
                .absentToday(absentsToday)
                .pendingLeaveRequests(pendingLeaves)
                .recentAttendance(recentAttendance)
                .build();

        return ApiResponse.success("Admin dashboard retrieved successfully", response);
    }
}

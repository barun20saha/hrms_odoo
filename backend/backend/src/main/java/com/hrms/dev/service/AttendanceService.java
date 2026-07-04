package com.hrms.dev.service;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.AttendanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    ApiResponse<AttendanceResponse> checkIn(String email, String remarks);
    ApiResponse<AttendanceResponse> checkOut(String email, String remarks);
    ApiResponse<List<AttendanceResponse>> getOwnAttendanceHistory(String email, LocalDate startDate, LocalDate endDate);
    
    // Admin operations
    ApiResponse<List<AttendanceResponse>> getAllAttendance();
    ApiResponse<List<AttendanceResponse>> getDailyAttendance(LocalDate date);
    ApiResponse<List<AttendanceResponse>> getWeeklyAttendance(LocalDate startDate, LocalDate endDate);
    ApiResponse<List<AttendanceResponse>> getAttendanceByEmployee(String employeeId);
}

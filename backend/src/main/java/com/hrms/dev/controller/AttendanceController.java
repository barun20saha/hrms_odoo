package com.hrms.dev.controller;

import com.hrms.dev.dto.ApiResponse;
import com.hrms.dev.dto.AttendanceResponse;
import com.hrms.dev.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Attendance Management", description = "Endpoints for employee check-in/check-out and admin attendance reporting")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // --- EMPLOYEE ENDPOINTS ---

    @PostMapping("/employee/attendance/check-in")
    @Operation(summary = "Check in today (Employee/Admin)")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(Authentication authentication, @RequestParam(required = false) String remarks) {
        ApiResponse<AttendanceResponse> response = attendanceService.checkIn(authentication.getName(), remarks);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/employee/attendance/check-out")
    @Operation(summary = "Check out today (Employee/Admin)")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(Authentication authentication, @RequestParam(required = false) String remarks) {
        ApiResponse<AttendanceResponse> response = attendanceService.checkOut(authentication.getName(), remarks);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/employee/attendance/history")
    @Operation(summary = "Retrieve logged-in employee attendance history (Employee/Admin)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getOwnAttendanceHistory(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getOwnAttendanceHistory(authentication.getName(), startDate, endDate);
        return ResponseEntity.ok(response);
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/admin/attendance/all")
    @Operation(summary = "View all attendance records (Admin only)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAllAttendance() {
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getAllAttendance();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/attendance/daily")
    @Operation(summary = "View daily attendance for a specific date (Admin only)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getDailyAttendance(date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/attendance/weekly")
    @Operation(summary = "View weekly/range attendance records (Admin only)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getWeeklyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getWeeklyAttendance(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/attendance/employee/{employeeId}")
    @Operation(summary = "View attendance history of a specific employee (Admin only)")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceByEmployee(@PathVariable String employeeId) {
        ApiResponse<List<AttendanceResponse>> response = attendanceService.getAttendanceByEmployee(employeeId);
        return ResponseEntity.ok(response);
    }
}
